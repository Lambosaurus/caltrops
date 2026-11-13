/* A row of d4 results drawn as triangles; a 4 is a success. */
function DiceResult({ dice }: { dice: number[] }): JSX.Element {
  return <div className='flex gap-4 flex-row flex-wrap justify-center mt-4'>
    {
    dice.map( (r, i) => {
      let success = r >= 4
      return <div key={i}
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 animate-ping"
        style={{
          animation: "ping 0.5s cubic-bezier(.49,.01,.83,.45)",
          animationDirection: "reverse",
          animationDelay: `${0.1 * i}s`,
          animationFillMode: "backwards"
        }}
        viewBox="0 0 100 100"
        strokeWidth={0}
        preserveAspectRatio="xMidYMid meet"
        >
          <polygon points="0,86 100,86 50,0"
            style={{strokeWidth: 2, stroke: success ? "hsl(var(--su))" : "hsl(var(--er))"}}
            fill={success ? "hsl(var(--suc))" : "hsl(var(--erc))"}
          />
          <text
            x={50}
            y={60}
            style={{fontSize: 48}}
            fill={success ? "hsl(var(--su))" : "hsl(var(--er))"}
            dominantBaseline="middle"
            textAnchor="middle"
          >
            {r}
          </text>
      </svg>
      </div>
      })
    }
    <div className='h-32 sm:h-0' />
  </div>
}

export default DiceResult
