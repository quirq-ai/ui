import { Button as AstryxButton, type ButtonProps as AstryxButtonProps } from "@astryxdesign/core/Button";

export type ButtonProps = AstryxButtonProps;
export type { ButtonSize, ButtonVariant } from "@astryxdesign/core/Button";

/**
 * Button built on Astryx `Button`. All props pass through — `label` is required
 * and doubles as the accessible name. Change project-wide defaults here.
 * See: https://astryx.atmeta.com/components/Button
 */
export function Button({ variant = "secondary", size = "md", ...props }: ButtonProps) {
	return <AstryxButton variant={variant} size={size} {...props} />;
}

export default Button;
