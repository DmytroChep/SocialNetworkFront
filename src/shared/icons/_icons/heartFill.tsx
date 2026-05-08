import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function HeartFillIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M10 17.792l-1.209-1.1C4.5 12.8 1.666 10.225 1.666 7.083 1.667 4.508 3.683 2.5 6.25 2.5c1.45 0 2.841.675 3.75 1.733A5.011 5.011 0 0113.75 2.5c2.567 0 4.583 2.008 4.583 4.583 0 3.142-2.833 5.717-7.125 9.609L10 17.792z"
        fill="#3E2D3C"
        fillOpacity={1}
      />
    </Svg>
  )
}
