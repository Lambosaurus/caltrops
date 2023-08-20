// Components
import { NumberEntryBox } from './EntryBox'

// Internal imports
import { EditMode, Modifier, keyModifier } from '../lib/util'
import { Currency, Dictionary } from '../lib/rules'



function CurrencyTable({currencies, values, setValues, editable = EditMode.Live}: {
    currencies: Currency[],
    values: Dictionary<number>,
    setValues(cb: Modifier<Dictionary<number>>): void,
    editable?: EditMode,
  }): JSX.Element | null {

  if (!currencies.length) { return null; }

  function setValue(currency: Currency, value: number) {
    setValues(keyModifier(currency.name, v => value))
  }

  return (
    <div>
      <table className="table table-compact">
        <thead>
        <tr>
            <th>Currency</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
          {
            currencies.map( currency => {
              return <tr className='hover' key={currency.name} >
                <td>{currency.name}</td>
                <td className='py-0'>
                  <NumberEntryBox
                    value={values[currency.name] ?? 0}
                    setValue={v => setValue(currency, v)}
                    precision={currency.precision ?? 0}
                    editable={editable >= EditMode.Live}
                  />
                </td>
              </tr>
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default CurrencyTable