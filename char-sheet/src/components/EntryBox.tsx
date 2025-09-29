// External imports
import { useState } from 'react'

// Internal imports
import { setPrecision } from '../lib/util'

function BackedEntryBox({value, setValue, isValid, limit = 32, editable, fieldType = "text"}: {
    value: string,
    setValue(value: string): void,
    isValid(value: string): boolean,
    limit?: number,
    editable: boolean,
    fieldType?: string,
  }): JSX.Element {
  
  const [focused, setFocused] = useState(false)
  const [text, setText] = useState("")

  let isError = focused ? !isValid(text) : false;

  function changeFocus(focused: boolean) {
    setFocused(focused)
    if (!focused) {
      // Focus lost. Lock in the number change.
      if (!isError && value !== text) {
        setValue(text)
      }
    }
    if (focused) {
      // Focus gained. Copy the text value into our backing string.
      setText(value)
    }
  }

  return <input
    type={fieldType}
    className={`input w-full max-w-xs input-bordered input-sm ${isError ? 'input-error' : ''}`}
    value={ focused ? text : value}
    onChange={e => { 
      let v = e.target.value
      if (v.length > limit) {
        v = v.substring(0, limit)
      }
      setText(v)
    }}
    onFocus={() => { changeFocus(true) }}
    onBlur={() => { changeFocus(false) }}
    disabled={!editable}
    />
}

export function NumberEntryBox({precision, value, setValue, editable=true}: {
  precision: number,
  value: number,
  setValue(value: number): void,
  editable?: boolean,
}) {

  function parseNumber(text: string): number {
    if (text.length === 0) {
      return 0;
    }
    return parseFloat(text)
  }
  
  return <BackedEntryBox
      value={value.toFixed(precision)}
      setValue={text => setValue(setPrecision(parseNumber(text), precision))}
      isValid={text => !isNaN(parseNumber(text))}
      editable={editable}
      fieldType='number'
    />
}
