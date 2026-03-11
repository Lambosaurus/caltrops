// Components
import { NumberEntryBox } from './EntryBox'

// Internal imports
import ObjectService from '../lib/objectservice';
import { EditMode } from '../lib/util'
import { Currency, Dictionary } from '../lib/rules'



function CurrencyTable({currencies, service, editable = EditMode.Live}: {
    currencies: Currency[],
    service: ObjectService,
    editable?: EditMode,
  }): JSX.Element | null {

  if (!currencies.length) { return null; }

  const values: Dictionary<number> = service.subscribe()

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
                    setValue={v => service.set_key(currency.name, v) }
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