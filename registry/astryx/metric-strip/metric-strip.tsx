import { Fragment, type CSSProperties } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { HStack, StackItem, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";

export type Metric = {
	label: string;
	value: string;
	/** Change vs the previous period, e.g. "+12%". */
	delta?: string;
	trend?: "up" | "down" | "flat";
	caption?: string;
};

export type MetricStripProps = {
	metrics?: Metric[];
};

const TREND_COLOR = { up: "green", down: "red", flat: "gray" } as const;

const dividerFill: CSSProperties = {
	alignSelf: "stretch",
	height: "auto",
};

const DEFAULT_METRICS: Metric[] = [
	{ label: "Revenue", value: "$24,500", delta: "+12%", trend: "up", caption: "vs last month" },
	{ label: "Active users", value: "1,240", delta: "+8%", trend: "up", caption: "vs last month" },
	{ label: "Conversion", value: "3.2%", delta: "-0.5%", trend: "down", caption: "vs last month" },
];

export function MetricStrip({ metrics = DEFAULT_METRICS }: MetricStripProps) {
	return (
		<Card>
			<HStack gap={4} align="stretch">
				{metrics.map((metric, index) => (
					<Fragment key={metric.label}>
						{index > 0 && <Divider orientation="vertical" style={dividerFill} />}
						<StackItem size="fill">
							<VStack gap={1}>
								<Text type="supporting">{metric.label}</Text>
								<Text type="large" weight="semibold" hasTabularNumbers>
									{metric.value}
								</Text>
								{metric.delta && (
									<HStack gap={1} align="center">
										<Token
											size="sm"
											label={metric.delta}
											color={TREND_COLOR[metric.trend ?? "flat"]}
										/>
										{metric.caption && <Text type="supporting">{metric.caption}</Text>}
									</HStack>
								)}
							</VStack>
						</StackItem>
					</Fragment>
				))}
			</HStack>
		</Card>
	);
}

export default MetricStrip;
