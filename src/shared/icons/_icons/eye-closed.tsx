import * as React from "react"
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg"

export function EyeClosed(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <G clipPath="url(#clip0_11652_1042)">
        <Path
          d="M8.233 8.233a2.5 2.5 0 103.533 3.534M8.941 4.233a8.692 8.692 0 011.058-.066c5.834 0 8.334 5.833 8.334 5.833-.373.798-.84 1.547-1.392 2.233M5.508 5.508A11.272 11.272 0 001.666 10s2.5 5.833 8.333 5.833a8.116 8.116 0 004.492-1.341M1.666 1.667l16.667 16.666"
          stroke="#81818D"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={1}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_11652_1042">
          <Path fill="#fff" d="M0 0H20V20H0z" fillOpacity={1} />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
