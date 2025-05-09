import { OnChange } from 'types/FormEvent'
import { OnChangeInput } from 'types/OnInputChangeProps'
import { useAutoAnimate } from '@formkit/auto-animate/preact'
import { useState } from 'preact/hooks'
import DateInput from 'components/DateInput'
import Patient, { CommonContent } from 'types/Patient'
import { v4 } from 'uuid'

interface ExtractedInputsProps {
  currentPatient: Patient
  onChange: OnChangeInput
}

function ProcessedInput({
  input,
  onChange,
}: {
  input: CommonContent
  onChange: OnChange
}) {
  const { options, value, type } = input

  if (options?.length)
    return (
      <select
        class="select select-bordered select-xs "
        value={value}
        onInput={(e) =>
          onChange({ currentTarget: { value: e.currentTarget.value } })
        }
      >
        {options.map((option) => (
          <option value={option} key={option + v4()}>
            {option}
          </option>
        ))}
      </select>
    )

  if (type === 'date') return <DateInput value={value} onChange={onChange} />

  return (
    <input
      className="placeholder:text-opacity-30 placeholder:text-slate-500 input input-bordered"
      placeholder={input.placeholder || '---'}
      onInput={onChange}
      {...input}
    >
      {value}
    </input>
  )
}

export default function ({ currentPatient, onChange }: ExtractedInputsProps) {
  const elements = Object.entries(currentPatient).map(([headerId, data]) => {
    const [parent] = useAutoAnimate()
    const [collapsed, setCollapsed] = useState(false)

    return (
      <div className="relative">
        <h2
          id={headerId}
          className="sticky top-0 py-4 bg-base-100 text-right hover:opacity-70 active:opacity-50 transition-opacity cursor-pointer z-10"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {data.header.value} {collapsed ? '+' : '-'}
        </h2>

        {data.warning?.value ? <span>{data.warning.value}</span> : null}

        <section ref={parent}>
          {collapsed
            ? null
            : Object.entries(data).map(([inputKey, inputValue], index) => {
                const input = inputValue as CommonContent

                if (!index || !input?.title) return null
                const { type = 'string' } = input

                return (
                  <label class="form-control w-full my-2">
                    <b>{input.title}</b>
                    <ProcessedInput
                      input={input}
                      onChange={({ currentTarget }) => {
                        onChange({
                          value:
                            type === 'date'
                              ? currentTarget.value
                              : type === 'number'
                                ? currentTarget.valueAsNumber
                                : currentTarget.value,
                          headerId,
                          inputKey,
                        })
                      }}
                    />
                  </label>
                )
              })}
        </section>
      </div>
    )
  })

  return <>{elements}</>
}
