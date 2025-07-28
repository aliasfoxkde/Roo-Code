import { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode
	description?: string
}

export const SectionHeader = ({ description, children, className, ...props }: SectionHeaderProps) => {
	return (
		<div
			className={cn(
				"sticky top-0 z-10 text-vscode-sideBar-foreground bg-vscode-sideBar-background brightness-90 px-5 py-3",
				className,
			)}
			{...props}>
			<h4 className="m-0">{children}</h4>
			{description && <p className="text-vscode-descriptionForeground text-sm section-header-description">{description}</p>}
		</div>
	)
}
