import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function MicroIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M10 .852a3.938 3.938 0 013.938 3.937v4.904A3.942 3.942 0 0110 13.631a3.942 3.942 0 01-3.938-3.938V4.79A3.938 3.938 0 0110 .852zm0 1.745a2.194 2.194 0 00-2.192 2.192v4.904a2.193 2.193 0 104.384 0V4.79A2.192 2.192 0 0010 2.597zm-.873 14.046l-.04-.006a7.015 7.015 0 01-6.09-6.944l.004-.086a.874.874 0 011.741.086 5.258 5.258 0 0010.516 0 .873.873 0 111.745 0 7.013 7.013 0 01-6.09 6.944l-.04.006v1.632a.873.873 0 11-1.746 0v-1.632z"
        fill="#81818D"
        stroke="#81818D"
        strokeWidth={0.09375}
        fillOpacity={1}
        strokeOpacity={1}
      />
    </Svg>
  )
}
