import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function ExitIcon(props: SvgProps) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M3.125 2.228h5a.898.898 0 110 1.794H4.022v11.956h4.103a.898.898 0 110 1.795h-5a.898.898 0 01-.898-.898V3.125a.898.898 0 01.898-.897zm10.623 3.749a.9.9 0 01.636.263l3.125 3.125a.897.897 0 010 1.272h0l-3.126 3.125a.9.9 0 11-1.271-1.272l1.525-1.524.069-.068H8.125a.898.898 0 110-1.795h6.58l-.068-.069-1.524-1.522a.9.9 0 01.636-1.535z"
        fill="#070A1C"
        stroke="#070A1C"
        strokeWidth={0.08}
        fillOpacity={1}
        strokeOpacity={1}
      />
    </Svg>
  )
}