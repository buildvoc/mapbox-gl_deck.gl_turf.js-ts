import { render, screen } from "@testing-library/react";
import CustomSlider from "./slider";


describe('CustomSlider', () => {
    const inputs = { lotCoverage: 50, floorNumber: 10, floorHeight: 10 }
    it('slider label displays correct label', () => {
        render(<CustomSlider label='floorHeight' inputs={inputs} updateInputs={() => null} disabled={false} />)
        const sliderElement = screen.getByTestId("slider-label");
        const sliderLabelValue = sliderElement.textContent
        expect(sliderElement).toBeInTheDocument();
        expect(sliderLabelValue).toEqual('floor Height')                              
    })

    it('slider label displays symbol', () => {
        render(<CustomSlider label='lotCoverage' symbol="%" inputs={inputs} updateInputs={() => null} disabled={false} />)
        const sliderElement = screen.getByTestId("slider-label");
        const sliderLabelValue = sliderElement.textContent
        expect(sliderElement).toBeInTheDocument();
        expect(sliderLabelValue).toEqual('lot Coverage %')                              
    })
})