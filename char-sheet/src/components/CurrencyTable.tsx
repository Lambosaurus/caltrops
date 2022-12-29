// Components
import { NumberEntryBox } from './EntryBox'

// Internal imports
import { modifyObject } from '../lib/util'
import { Currency, Dictionary } from '../lib/rules'



function CurrencyTable({currencies, values, setValues}: {
    currencies: Currency[],
    values: Dictionary<number>,
    setValues(values: Dictionary<number>): void,
  }): JSX.Element {

  function setValue(currency: Currency, value: number) {
    setValues(modifyObject(values, currency.name, value))
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