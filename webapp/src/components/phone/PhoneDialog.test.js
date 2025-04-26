import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PhoneDialog from "./PhoneDialog";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const customTheme = createTheme({
  palette: {
    primary: { main: "#1976d2", contrastText: "#fff" },
    text: { primary: "#000", secondary: "#666" },
    grey: { 300: "#ccc" },
    background: { default: "#fafafa" },
    surface: { main: "#fff" },
  },
});

const mockRoundData = {
  topic: "Sports",
  mainTopic: "sports",
  itemWithImage: { name: "Usain Bolt" },
};

const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={customTheme}>{ui}</ThemeProvider>);
};

describe("PhoneDialog", () => {
  it("renders locked screen initially", () => {
    renderWithTheme(<PhoneDialog onClose={() => {}} chatKey="123" roundData={mockRoundData} />);
    expect(screen.getByText(/your phone is locked now/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /press here to unlock/i })).toBeInTheDocument();
  });

  it("unlocks phone and shows contact list", async () => {
    renderWithTheme(<PhoneDialog onClose={() => {}} chatKey="123" roundData={mockRoundData} />);
    fireEvent.click(screen.getByRole("button", { name: /press here to unlock/i }));
    expect(await screen.findByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/Fernando Alonso/i)).toBeInTheDocument();
  });

  it("filters contacts by search input", async () => {
    renderWithTheme(<PhoneDialog onClose={() => {}} chatKey="123" roundData={mockRoundData} />);
    fireEvent.click(screen.getByRole("button", { name: /press here to unlock/i }));

    const searchInput = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Lady Gaga" } });

    expect(screen.getByText(/Lady Gaga/i)).toBeInTheDocument();
    expect(screen.queryByText(/Fernando Alonso/i)).not.toBeInTheDocument();
  });

  it("calls a contact and moves to chat view", async () => {
    renderWithTheme(<PhoneDialog onClose={() => {}} chatKey="123" roundData={mockRoundData} />);
    fireEvent.click(screen.getByRole("button", { name: /press here to unlock/i }));

    const contact = await screen.findByText(/Fernando Alonso/i);
    fireEvent.click(contact);

    expect(await screen.findByText(/calling/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/calling/i)).not.toBeInTheDocument(), { timeout: 2000 });
    expect(await screen.findByText(/chat with fernando alonso/i)).toBeInTheDocument();
  });

  it("goes back to contacts after ending a chat", async () => {
    renderWithTheme(<PhoneDialog onClose={() => {}} chatKey="123" roundData={mockRoundData} />);
    fireEvent.click(screen.getByRole("button", { name: /press here to unlock/i }));

    const contact = await screen.findByText(/Fernando Alonso/i);
    fireEvent.click(contact);

    await waitFor(() => expect(screen.queryByText(/calling/i)).not.toBeInTheDocument(), { timeout: 2000 });

    const closeButton = screen.getAllByRole("button")[0]; // Top left close icon
    fireEvent.click(closeButton);

    expect(await screen.findByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("locks the phone again from contacts", async () => {
    renderWithTheme(<PhoneDialog onClose={() => {}} chatKey="123" roundData={mockRoundData} />);
    fireEvent.click(screen.getByRole("button", { name: /press here to unlock/i }));

    const closeButton = screen.getAllByRole("button")[0]; // Top left close icon
    fireEvent.click(closeButton);

    expect(await screen.findByText(/your phone is locked now/i)).toBeInTheDocument();
  });
});
