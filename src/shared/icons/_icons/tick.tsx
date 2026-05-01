import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function Tick(props: SvgProps) {
    return (
        <Svg
        width={15}
        height={15}
        viewBox="0 0 15 15"
        {...props}
        >
        <Path
            d="M13.125 2.813L5.25 12.187l-3.375-3.75"
            stroke="color(display-p3 .3294 .2353 .3216)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={1}
        />
        </Svg>
    )
}