// Components
import { NumberEntryBox } from './EntryBox'

// Internal imports
import { View, useListener } from '../lib/objectservice';
import { EditMode } from '../lib/util'
import { Currency, Dictionary } from '../lib/rules'



function CurrencyTable({currencies, view, editable = EditMode.Live}: {
    currencies: Currency[],
    view: View,
    editable?: EditMode,
  }): JSX.Element | null {

  const values: Dictionary<number> = useListener(view)

  if (!currencies.length) { return null; }

  return (
    <div>
      <table className="table table-compact w-80">
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
                    setValue={v => view.publish(currency.name, v) }
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