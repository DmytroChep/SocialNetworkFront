import Svg, { Path, type SvgProps } from "react-native-svg";

export function EditIcon(props: SvgProps) {
	return (
		<Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
			<Path
				d="M4.167 15.833h1.187L13.5 7.687 12.312 6.5l-8.145 8.146v1.187zM2.5 17.5v-3.542l11-10.979c.167-.153.35-.27.553-.354.201-.083.413-.125.634-.125.222 0 .437.042.646.125.21.083.39.208.542.375l1.146 1.167c.166.152.288.333.365.541a1.783 1.783 0 010 1.261 1.542 1.542 0 01-.365.552L6.04 17.5H2.5zM12.896 7.104l-.584-.604L13.5 7.688l-.604-.584z"
				fill="#070A1C"
				fillOpacity={1}
			/>
		</Svg>
	);
}
