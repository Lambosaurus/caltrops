import type { Chassis } from '../../lib/mech/types'

const FILL = 'rgba(32,214,250,0.07)'
const STROKE = 'rgba(32,214,250,0.16)'

/* Faint body outline behind the section grid. Purely decorative. */
function ChassisSilhouette({ chassis }: { chassis: Chassis }): JSX.Element {
  const p = { fill: FILL, stroke: STROKE }
  return <svg
    className='absolute inset-0 w-full h-full pointer-events-none'
    viewBox='0 0 100 100'
    preserveAspectRatio='none'
    aria-hidden='true'
  >
    <rect x='40' y='2' width='20' height='16' rx='3' {...p}/>
    <path d='M30 20 L70 20 L74 40 L66 66 L34 66 L26 40 Z' {...p}/>
    <path d='M28 22 L8 26 L4 58 L14 60 L20 34 L30 32 Z' {...p}/>
    <path d='M72 22 L92 26 L96 58 L86 60 L80 34 L70 32 Z' {...p}/>
    {chassis.sections.some(s => s.id === 'shoulder') ? <>
      <rect x='68' y='4' width='20' height='14' rx='2' {...p}/>
      <path d='M70 18 L72 22' stroke={STROKE}/>
    </> : null}
    {chassis.shape === 'tracked' ? <>
      <rect x='22' y='70' width='56' height='26' rx='6' {...p}/>
      <circle cx='32' cy='83' r='6' fill='none' stroke={STROKE}/>
      <circle cx='50' cy='83' r='6' fill='none' stroke={STROKE}/>
      <circle cx='68' cy='83' r='6' fill='none' stroke={STROKE}/>
    </> : <>
      <path d='M38 64 L30 96 L42 96 L47 64 Z' {...p}/>
      <path d='M62 64 L70 96 L58 96 L53 64 Z' {...p}/>
    </>}
  </svg>
}

export default ChassisSilhouette
