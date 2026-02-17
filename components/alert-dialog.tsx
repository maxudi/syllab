'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  type?: AlertType
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function AlertDialog({ open, onOpenChange, title, description, type = 'info' }: AlertDialogProps) {
  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <XCircle className="w-12 h-12 text-red-500" />,
    warning: <AlertCircle className="w-12 h-12 text-amber-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />
  }

  const colors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full ${colors[type]} flex items-center justify-center mb-4`}>
            {icons[type]}
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <Button onClick={() => onOpenChange(false)} className="min-w-[120px]">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  onConfirm, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-amber-500" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar alertas de forma programática
export function useAlert() {
  const [alertState, setAlertState] = useState<{
    open: boolean
    title: string
    description: string
    type: AlertType
  }>({
    open: false,
    title: '',
    description: '',
    type: 'info'
  })

  const showAlert = (title: string, description: string, type: AlertType = 'info') => {
    setAlertState({ open: true, title, description, type })
  }

  const AlertComponent = () => (
    <AlertDialog
      open={alertState.open}
      onOpenChange={(open) => setAlertState({ ...alertState, open })}
      title={alertState.title}
      description={alertState.description}
      type={alertState.type}
    />
  )

  return { showAlert, AlertComponent }
}

// Hook para confirmações
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
    confirmText: string
    cancelText: string
    variant: 'default' | 'destructive'
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default'
  })

  const showConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string
      cancelText?: string
      variant?: 'default' | 'destructive'
    }
  ) => {
    setConfirmState({
      open: true,
      title,
      description,
      onConfirm,
      confirmText: options?.confirmText || 'Confirmar',
      cancelText: options?.cancelText || 'Cancelar',
      variant: options?.variant || 'default'
    })
  }

  const ConfirmComponent = () => (
    <ConfirmDialog
      open={confirmState.open}
      onOpenChange={(open) => setConfirmState({ ...confirmState, open })}
      title={confirmState.title}
      description={confirmState.description}
      onConfirm={confirmState.onConfirm}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      variant={confirmState.variant}
    />
  )

  return { showConfirm, ConfirmComponent }
}
