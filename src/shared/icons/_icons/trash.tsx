import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function TrashIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M3.333 5.833h13.334M8.333 9.167v5m3.334-5v5m-7.5-8.334l.833 10A1.666 1.666 0 006.667 17.5h6.667A1.667 1.667 0 0015 15.833l.834-10m-8.334 0v-2.5a.833.833 0 01.834-.833h3.333a.833.833 0 01.833.833v2.5"
        stroke="#000000"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  )
}