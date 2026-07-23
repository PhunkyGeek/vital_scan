"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'
import { CaptureMethodTabs } from '@/components/scan/CaptureMethodTabs'
import { createClient } from '@/lib/supabase/client'
import { CameraCapture } from '@/components/scan/CameraCapture'
import { ImagePreviewCard } from '@/components/scan/ImagePreviewCard'
import { ScanTipsCard } from '@/components/scan/ScanTipsCard'
import { ScanUploadCard } from '@/components/scan/ScanUploadCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload } from 'lucide-react'
import { scanFormSchema } from '@/lib/validators'
import { formatFileSize } from '@/lib/utils/file'

type ScanFormValues = z.infer<typeof scanFormSchema>

const bodyAreaOptions = [
  { label: 'Skin', value: 'skin' },
  { label: 'Eye', value: 'eye' },
  { label: 'Throat', value: 'throat' },
  { label: 'Nail', value: 'nail' },
  { label: 'Wound', value: 'wound' },
  { label: 'Other', value: 'other' },
] as const

const ageGroupOptions = [
  { label: 'Child', value: 'child' },
  { label: 'Teen', value: 'teen' },
  { label: 'Adult', value: 'adult' },
  { label: 'Senior', value: 'senior' },
] as const

export default function ScanPage() {
  const router = useRouter()
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      bodyArea: 'skin',
      ageGroup: 'adult',
      durationText: '',
      symptomNotes: '',
      fever: false,
      itching: false,
      pain: false,
      redness: false,
      image: undefined,
    },
    mode: 'onBlur',
  })

  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage]
  )

  useEffect(() => {
    if (selectedImage) {
      setValue('image', selectedImage, { shouldValidate: true, shouldDirty: true })
    }
  }, [selectedImage, setValue])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setFormError(null)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    resetField('image')
  }

  const onSubmit = async (data: ScanFormValues) => {
    if (!selectedImage) {
      setFormError('Please upload or capture an image before continuing.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('body_area', data.bodyArea)
      if (data.ageGroup) formData.append('age_group', data.ageGroup)
      if (data.durationText) formData.append('duration_text', data.durationText)
      if (data.symptomNotes) formData.append('symptom_notes', data.symptomNotes)
      formData.append('fever', String(data.fever))
      formData.append('itching', String(data.itching))
      formData.append('pain', String(data.pain))
      formData.append('redness', String(data.redness))

      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        setFormError('Unable to authenticate. Please sign in again.')
        setIsSubmitting(false)
        return
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('Missing Supabase URL configuration')
      }

      // Step 1: Call analyze-screening to upload and analyze
      const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-screening`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const analyzeResult = await analyzeResponse.json()

      if (!analyzeResponse.ok) {
        setFormError(analyzeResult.error || 'Unable to analyze the image. Please try again.')
        setIsSubmitting(false)
        return
      }

      const { screening_id, result } = analyzeResult

      if (!screening_id || !result) {
        setFormError('Invalid response from analysis. Please try again.')
        setIsSubmitting(false)
        return
      }

      console.log('Analyze screening response:', { screening_id, result })

      // Success: screening has been saved by analyze-screening, redirect to result page
      router.push(`/scan/${screening_id}`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unexpected error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">AI Screening</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Capture a clear scan for AI-assisted screening
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Upload or capture an image, add symptom context, and receive a conservative, evidence-aware screening summary.
            </p>
          </div>
          <Badge variant="secondary" className="max-w-fit px-4 py-2 text-sm">
            Secure Supabase upload + Gemini analysis
          </Badge>
        </div>

        <DisclaimerBanner />

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                  <Upload className="h-4 w-4 text-primary" />
                  <span>Step 1 — select capture method</span>
                </div>
                <CaptureMethodTabs value={captureMode} onChange={setCaptureMode} />
                {captureMode === 'upload' ? (
                  <ScanUploadCard
                    selectedFile={selectedImage}
                    onFileSelect={handleImageSelect}
                    onRemove={handleRemoveImage}
                    error={errors.image?.message?.toString()}
                  />
                ) : (
                  <CameraCapture
                    selectedFile={selectedImage}
                    onCapture={handleImageSelect}
                    onRemove={handleRemoveImage}
                  />
                )}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <ImagePreviewCard previewUrl={previewUrl} file={selectedImage} onRemove={handleRemoveImage} />
              <ScanTipsCard />
            </div>
          </section>

          <section>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Scan details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  {formError ? (
                    <Alert>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Body area</label>
                      <Select {...register('bodyArea')}>
                        {bodyAreaOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      {errors.bodyArea ? <p className="text-sm text-destructive">{errors.bodyArea.message}</p> : null}
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Age group</label>
                      <Select {...register('ageGroup')}>
                        <option value="">Select age group</option>
                        {ageGroupOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      {errors.ageGroup ? <p className="text-sm text-destructive">{errors.ageGroup.message}</p> : null}
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Symptom notes</label>
                      <Textarea {...register('symptomNotes')} placeholder="Optional: describe what you feel and where" />
                      {errors.symptomNotes ? <p className="text-sm text-destructive">{errors.symptomNotes.message}</p> : null}
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Duration</label>
                      <Input {...register('durationText')} placeholder="e.g. 2 days, several weeks" />
                      {errors.durationText ? <p className="text-sm text-destructive">{errors.durationText.message}</p> : null}
                    </div>

                    <div className="grid gap-3 rounded-3xl border border-muted-foreground/10 bg-background/80 p-4">
                      <p className="text-sm font-semibold text-foreground">Symptom details</p>
                      <Controller
                        name="fever"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Fever</p>
                              <p className="text-sm text-muted-foreground">Whether fever is present or not.</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        )}
                      />
                      <Controller
                        name="itching"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Itching</p>
                              <p className="text-sm text-muted-foreground">Help the model understand this symptom.</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        )}
                      />
                      <Controller
                        name="pain"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Pain</p>
                              <p className="text-sm text-muted-foreground">Toggle if the area is painful.</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        )}
                      />
                      <Controller
                        name="redness"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Redness</p>
                              <p className="text-sm text-muted-foreground">Indicate inflammation or irritation.</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Image attached</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedImage ? formatFileSize(selectedImage.size) : 'No file selected yet.'}
                      </p>
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? 'Analyzing…' : 'Analyze image'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
