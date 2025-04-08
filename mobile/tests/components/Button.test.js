import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "../../src/components/common/Button";

describe("Button Component", () => {
  it("renders correctly with default props", () => {
    const { getByText } = render(<Button title="Test Button" />);

    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress handler when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} />
    );

    fireEvent.press(getByText("Test Button"));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders loading indicator when loading is true", () => {
    const { queryByText, getByTestId } = render(
      <Button title="Test Button" loading={true} />
    );

    expect(queryByText("Test Button")).toBeNull();
    expect(getByTestId("button-loading")).toBeTruthy();
  });

  it("disables button when disabled prop is true", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Test Button" onPress={onPressMock} disabled={true} />
    );

    const button = getByTestId("button-component");

    fireEvent.press(button);

    expect(onPressMock).not.toHaveBeenCalled();
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ opacity: expect.any(Number) })
    );
  });

  it("applies custom styles when provided", () => {
    const customStyle = { backgroundColor: "red", borderRadius: 10 };
    const { getByTestId } = render(
      <Button title="Test Button" style={customStyle} />
    );

    const button = getByTestId("button-component");

    expect(button.props.style).toContainEqual(
      expect.objectContaining(customStyle)
    );
  });

  it("renders custom text style when provided", () => {
    const textStyle = { fontSize: 20, color: "red" };
    const { getByText } = render(
      <Button title="Test Button" textStyle={textStyle} />
    );

    const text = getByText("Test Button");

    expect(text.props.style).toContainEqual(expect.objectContaining(textStyle));
  });
});
