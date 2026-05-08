import * as React from "react"
import Svg, { Path, SvgProps} from "react-native-svg"

export function PlaneIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M17.33 8.63L4.2 1.138a1.562 1.562 0 00-2.238 1.88L4.32 9.999 1.962 16.98a1.563 1.563 0 002.24 1.88l.006-.005 13.125-7.505a1.563 1.563 0 000-2.72h-.003zM3.997 16.816l1.985-5.88h4.328a.937.937 0 100-1.875H5.982l-1.986-5.88L15.93 9.99 3.997 16.815z"
        fill="#FFFFFF"
        fillOpacity={1}
      />
    </Svg>
  )
}
