import { useEffect, useState } from 'react'
import { useVersionStore } from '@/shared/store/versionStore'
import { ChangelogDialog } from './changelog'

export default function UpdateModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { markVersionAsViewed, showUpdateModal, setShowUpdateModal, updateHistory } =
    useVersionStore()

  const latestVersion = updateHistory[0]

  useEffect(() => {
    if (showUpdateModal) {
      setIsOpen(true)
    }
  }, [showUpdateModal])

  const handleClose = () => {
    if (latestVersion) {
      markVersionAsViewed(latestVersion.version)
    }
    setShowUpdateModal(false)
    setIsOpen(false)
  }

  if (updateHistory.length === 0) return null

  return (
    <ChangelogDialog
      isOpen={isOpen}
      onClose={handleClose}
      versions={updateHistory}
    />
  )
}
