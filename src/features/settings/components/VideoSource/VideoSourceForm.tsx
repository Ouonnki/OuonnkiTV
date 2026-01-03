import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Info, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm,
  type Resolver,
  type UseFormRegister,
  type FieldValues,
  type Path,
  type FieldErrors,
  type FieldError as RHFFieldError,
  type UseFormSetValue,
  type PathValue,
  Controller,
} from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { type VideoApi } from '@/types'
import { useApiStore } from '@/store/apiStore'
import { useState, useEffect } from 'react'

// 表单-字符串输入通用组件
interface InputFormItemProps<T extends FieldValues> {
  label: string
  description: string
  placeholder: string
  id: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  asChild?: boolean
  children?: React.ReactNode
  type?: string
}

function InputFormItem<T extends FieldValues>({
  label,
  description,
  placeholder,
  id,
  register,
  errors,
  asChild,
  children,
  type,
}: InputFormItemProps<T>) {
  return (
    <Field>
      <div className="flex flex-col items-start gap-1">
        <FieldLabel className="text-lg" htmlFor={id}>
          {label}
        </FieldLabel>
        <FieldDescription className="flex items-center gap-1">
          <Info size={16} className="hidden md:block" />
          {description}
        </FieldDescription>
      </div>
      {asChild ? (
        children
      ) : (
        <Input
          id={id}
          placeholder={placeholder}
          {...register(id)}
          aria-invalid={errors[id] ? true : false}
          type={type || 'text'}
        />
      )}
      <FieldError
        errors={errors[id] ? [{ message: (errors[id] as RHFFieldError)?.message }] : []}
      />
    </Field>
  )
}

// 表单-视频源输入组件
function VideoSourceFormItem<T extends FieldValues>({
  register,
  errors,
  setValue,
}: {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
}) {
  const [isRandomId, setIsRandomId] = useState(false)
  const handleRandomIdChange = (checked: boolean) => {
    setIsRandomId(checked)
    if (checked) {
      setValue('id' as Path<T>, uuidv4() as PathValue<T, Path<T>>)
    }
  }
  return (
    <InputFormItem
      label="视频源 ID"
      description="视频源的唯一标识"
      placeholder="例如：source1"
      id={'id' as Path<T>}
      register={register}
      errors={errors}
      asChild
    >
      <div className="flex items-center justify-between gap-5">
        <Input
          placeholder="例如：source1"
          {...register('id' as Path<T>)}
          aria-invalid={errors['id'] ? true : false}
          disabled={isRandomId}
        />
        <div className="flex w-40 items-center justify-end gap-2">
          <Checkbox checked={isRandomId} onCheckedChange={handleRandomIdChange} />
          <Label>使用随机ID</Label>
        </div>
      </div>
    </InputFormItem>
  )
}

// 视频源表单
export default function VideoSourceForm({ sourceInfo }: { sourceInfo: VideoApi }) {
  const { removeVideoAPI, addAndUpdateVideoAPI, videoAPIs } = useApiStore()
  const formSchema = z.object({
    id: z.string().min(1, '视频源ID不能为空').default(uuidv4()),
    name: z.string().min(1, '视频源名称不能为空').default('视频源1'),
    url: z.string().regex(/^(http|https):\/\//, '请输入有效的URL'),
    detailUrl: z
      .string()
      .regex(/^(http|https):\/\//, '请输入有效的URL')
      .or(z.literal(''))
      .optional(),
    timeout: z.coerce.number().min(300, '超时时间不能为空且需要大于等于300ms').optional(),
    retry: z.coerce.number().min(0, '重试次数不能为空且需要大于等于0').optional(),
    updatedAt: z.coerce.date().default(() => new Date()),
    isEnabled: z.boolean().default(true),
  })
  // 类型推导
  type FormSchema = z.infer<typeof formSchema>
  // 表单实例
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as Resolver<FormSchema>,
    defaultValues: {
      id: sourceInfo.id,
      name: sourceInfo.name,
      url: sourceInfo.url,
      detailUrl: sourceInfo.detailUrl,
      timeout: sourceInfo.timeout,
      retry: sourceInfo.retry,
      updatedAt: sourceInfo.updatedAt,
      isEnabled: sourceInfo.isEnabled,
    },
  })

  // 监听 props 变化，更新表单数据
  useEffect(() => {
    reset(sourceInfo)
  }, [sourceInfo, reset])
  // 表单提交
  const onSubmit = (data: FormSchema) => {
    // 如果修改了 ID，且新 ID 已存在
    if (data.id !== sourceInfo.id) {
      if (videoAPIs.some(api => api.id === data.id)) {
        toast.error('保存失败，视频源ID已存在')
        return
      }
      // 如果修改了 ID，先删除旧的
      removeVideoAPI(sourceInfo.id)
    }

    addAndUpdateVideoAPI(data)
    toast.success('保存成功')
  }

  // 表单验证错误处理
  const onInvalid = (errors: FieldErrors<FormSchema>) => {
    console.error('Form validation errors:', errors)
    toast.error('保存失败，请检查表单填写是否正确')
  }

  // 高级设置
  const [isOpen, setIsOpen] = useState(false)
  // 删除视频源
  const handleDelete = (id: string) => {
    removeVideoAPI(id)
    toast.success('删除成功')
  }
  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-4 pt-4">
        {/* 基本设置 */}
        <FieldSet>
          <FieldLegend className="text-xl! font-semibold">基本信息</FieldLegend>
          <FieldDescription>视频源的基本信息</FieldDescription>
          <FieldGroup>
            <VideoSourceFormItem register={register} errors={errors} setValue={setValue} />
            <InputFormItem
              label="视频源名称"
              description="视频源用于显示的名称"
              placeholder="例如：视频源1"
              id="name"
              register={register}
              errors={errors}
            />
            <InputFormItem
              label="视频源 URL"
              description="用于视频源解析的 URL"
              placeholder="例如：https://example.com"
              id="url"
              register={register}
              errors={errors}
              type="url"
            />
            <InputFormItem
              label="视频源详情 URL"
              description="用于视频源解析的详情 URL，留空则使用视频源 URL"
              placeholder="例如：https://example.com"
              id="detailUrl"
              register={register}
              errors={errors}
              type="url"
            />
            <Field orientation="horizontal">
              <FieldLabel className="text-lg" htmlFor="isEnabled">
                是否启用视频源
              </FieldLabel>
              <Controller
                control={control}
                name="isEnabled"
                render={({ field }) => (
                  <Switch id="isEnabled" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        {/* 高级设置 */}
        <FieldSet>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between pb-6">
              <div>
                <FieldLegend className="text-xl! font-semibold">高级设置</FieldLegend>
                <FieldDescription>
                  视频源的高级设置，包括超时时间、重试次数等（可选）
                </FieldDescription>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronsUpDown />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-2">
              <FieldGroup>
                <InputFormItem
                  label="超时时间"
                  description="视频源解析的超时时间，单位为毫秒"
                  placeholder="例如：3000"
                  id="timeout"
                  register={register}
                  errors={errors}
                  type="number"
                />
                <InputFormItem
                  label="重试次数"
                  description="视频源解析的重试次数"
                  placeholder="例如：3"
                  id="retry"
                  register={register}
                  errors={errors}
                  type="number"
                />
              </FieldGroup>
            </CollapsibleContent>
          </Collapsible>
        </FieldSet>
        <div className="flex items-end justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <span className="text-red-600 hover:cursor-pointer hover:text-red-500 hover:underline">
                删除本视频源
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="h-fit bg-white/20 backdrop-blur-md"
              overlayClassName="bg-white/40 backdrop-blur-xs"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>确定要删除本视频源吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作无法撤销，确认后将<span className="text-red-600">永久删除</span>
                  本视频源，请谨慎操作。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-0 bg-transparent shadow-none outline-0 hover:bg-transparent hover:text-gray-600">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(sourceInfo.id)}
                  className="bg-red-600 hover:bg-red-500"
                >
                  确定删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="default" type="submit" className="shadow-2xl">
            保存
          </Button>
        </div>
      </div>
    </form>
  )
}
