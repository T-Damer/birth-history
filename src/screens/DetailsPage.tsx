import { navigate } from 'wouter-preact/use-hash-location'
import { useAtom } from 'jotai'
import { useCallback } from 'preact/hooks'
import Button from 'components/Button'
import DetailsHeader from 'components/DetailsHeader'
import ExtractedInputs from 'components/ExtractedInputs'
import NotFound from 'components/NotFound'
import OnInputChangeProps from 'types/OnInputChangeProps'
import handleError from 'helpers/handleError'
import patientsDataStore, {
  AvailableInputKeys,
  AvailableSections,
} from 'atoms/patientsDataStore'
import saveObjectAsJson from 'helpers/saveObjectAsJson'

export default function ({ id }: { id: string }) {
  const [patientsData, setPatientsData] = useAtom(patientsDataStore)
  const currentPatient = patientsData[id]

  const deleteEntry = useCallback(() => {
    if (!currentPatient) {
      const e = 'Не получилось найти пациента при удалении :('
      handleError({ e, toastMessage: e })
      return
    }

    delete patientsData[id]

    navigate('/birth-history')
    setPatientsData(patientsData)
  }, [currentPatient, id, patientsData, setPatientsData])

  const onChange = useCallback(
    ({ value, headerId, inputKey }: OnInputChangeProps) => {
      const subHeaderData = currentPatient[headerId as AvailableSections]

      const updated = {
        ...currentPatient,
        [headerId]: {
          ...subHeaderData,
          [inputKey]: {
            ...(subHeaderData[inputKey as AvailableInputKeys] as object), // TS complains if you don't convert
            value,
          },
        },
      }

      setPatientsData((prev) => ({
        ...prev,
        [id]: updated,
      }))
    },
    [currentPatient, id, setPatientsData]
  )

  const saveAndExport = useCallback(() => {
    saveObjectAsJson(
      `ИР-${currentPatient.passport.historySerial.value}.csv`,
      currentPatient
    )
  }, [currentPatient])

  if (!currentPatient) return <NotFound />

  return (
    <div className="flex flex-col gap-x-2">
      <DetailsHeader deleteEntry={deleteEntry} />

      <ExtractedInputs currentPatient={currentPatient} onChange={onChange} />

      <Button isGreen onSubmit={saveAndExport}>
        Поделиться
      </Button>
    </div>
  )
}
