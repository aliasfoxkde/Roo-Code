// npx vitest src/components/settings/__tests__/ParametersControl.spec.tsx

import { render, screen, fireEvent } from "@/utils/test-utils"
import { ParametersControl } from "../ParametersControl"

describe("ParametersControl", () => {
	it("renders with default parameters disabled", () => {
		const onChange = vi.fn()
		render(<ParametersControl value={{}} onChange={onChange} />)
		
		const checkbox = screen.getByRole("checkbox")
		expect(checkbox).not.toBeChecked()
		
		// Should not show parameter controls when disabled
		expect(screen.queryByTestId("slider")).not.toBeInTheDocument()
	})

	it("renders with custom parameters enabled", () => {
		const onChange = vi.fn()
		render(
			<ParametersControl
				value={{
					temperature: 0.7,
					topP: 0.9,
					frequencyPenalty: 0.5,
					presencePenalty: 0.3,
					maxTokens: 1000
				}}
				onChange={onChange}
			/>
		)
		
		const checkbox = screen.getByRole("checkbox")
		expect(checkbox).toBeChecked()
		
		// Should show parameter controls when enabled
		expect(screen.getByText("Temperature")).toBeInTheDocument()
		expect(screen.getByText("Top P")).toBeInTheDocument()
		expect(screen.getByText("Frequency Penalty")).toBeInTheDocument()
		expect(screen.getByText("Presence Penalty")).toBeInTheDocument()
		expect(screen.getByText("Max Tokens")).toBeInTheDocument()
	})

	it("toggles custom parameters on checkbox change", () => {
		const onChange = vi.fn()
		const { rerender } = render(<ParametersControl value={{}} onChange={onChange} />)
		
		const checkbox = screen.getByRole("checkbox")
		expect(checkbox).not.toBeChecked()
		
		// Enable custom parameters
		fireEvent.click(checkbox)
		expect(onChange).toHaveBeenCalledWith({
			temperature: null,
			topP: null,
			frequencyPenalty: null,
			presencePenalty: null,
			maxTokens: null
		})
		
		// Disable custom parameters
		rerender(
			<ParametersControl
				value={{ temperature: 0.5 }}
				onChange={onChange}
			/>
		)
		fireEvent.click(checkbox)
		expect(onChange).toHaveBeenCalledWith({
			temperature: null,
			topP: null,
			frequencyPenalty: null,
			presencePenalty: null,
			maxTokens: null
		})
	})

	it("updates temperature value via slider", () => {
		const onChange = vi.fn()
		render(
			<ParametersControl
				value={{ temperature: 0.7 }}
				onChange={onChange}
			/>
		)
		
		const slider = screen.getByTestId("slider")
		fireEvent.change(slider, { target: { value: "0.8" } })
		
		expect(onChange).toHaveBeenCalledWith({
			temperature: 0.8,
			topP: null,
			frequencyPenalty: null,
			presencePenalty: null,
			maxTokens: null
		})
	})

	it("updates temperature value via text input", () => {
		const onChange = vi.fn()
		render(
			<ParametersControl
				value={{ temperature: 0.7 }}
				onChange={onChange}
			/>
		)
		
		const input = screen.getByDisplayValue("0.7")
		fireEvent.change(input, { target: { value: "0.9" } })
		
		expect(onChange).toHaveBeenCalledWith({
			temperature: 0.9,
			topP: null,
			frequencyPenalty: null,
			presencePenalty: null,
			maxTokens: null
		})
	})

	it("updates max tokens via text input", () => {
		const onChange = vi.fn()
		render(
			<ParametersControl
				value={{ maxTokens: 1000 }}
				onChange={onChange}
			/>
		)
		
		const input = screen.getByDisplayValue("1000")
		fireEvent.change(input, { target: { value: "2000" } })
		
		expect(onChange).toHaveBeenCalledWith({
			temperature: null,
			topP: null,
			frequencyPenalty: null,
			presencePenalty: null,
			maxTokens: 2000
		})
	})

	it("handles empty input for numeric fields", () => {
		const onChange = vi.fn()
		render(
			<ParametersControl
				value={{ temperature: 0.7 }}
				onChange={onChange}
			/>
		)
		
		const input = screen.getByDisplayValue("0.7")
		fireEvent.change(input, { target: { value: "" } })
		
		expect(onChange).toHaveBeenCalledWith({
			temperature: null,
			topP: null,
			frequencyPenalty: null,
			presencePenalty: null,
			maxTokens: null
		})
	})

	it("syncs internal state when props change", () => {
		const onChange = vi.fn()
		const { rerender } = render(
			<ParametersControl
				value={{ temperature: 0.7 }}
				onChange={onChange}
			/>
		)
		
		// Update to new value
		rerender(
			<ParametersControl
				value={{ temperature: 0.5 }}
				onChange={onChange}
			/>
		)
		
		const input = screen.getByDisplayValue("0.5")
		expect(input).toBeInTheDocument()
	})
})