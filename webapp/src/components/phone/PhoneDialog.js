import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "../../context/ThemeContext";
import PhoneDialog from "./PhoneDialog";

// Mock FriendChat avoid dependencies
jest.mock("./FriendChat", () => () => <div data-testid="mocked-friendchat">FriendChat Mock</div>);

jest.mock("../photos/lockedPic.png", () => "lockedPic.png");

describe("PhoneDialog component", () => {
  const mockRoundData = {
    mainTopic: "sports",
    topic: "football",
    itemWithImage: { name: "Cristiano Ronaldo" },
  };

  function renderComponent() {
    return render(
      <ThemeProvider>
        <MemoryRouter>
          <PhoneDialog onClose={jest.fn()} chatKey="123" roundData={mockRoundData} />
        </MemoryRouter>
      </ThemeProvider>
    );
  }

  it("renders the locked screen initially", () => {
    renderComponent();

    expect(screen.getByText(/Your phone is locked now/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Press here to unlock/i })).toBeInTheDocument();
  });

  it("unlocks the phone and shows contacts after pressing unlock", async () => {
    renderComponent();

    const unlockButton = screen.getByRole("button", { name: /Press here to unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });
  });

  it("filters contacts correctly with search", async () => {
    renderComponent();

    const unlockButton = screen.getByRole("button", { name: /Press here to unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "Beatles" } });

    expect(screen.getByText(/The Beatles/i)).toBeInTheDocument();
    expect(screen.queryByText(/Fernando Alonso/i)).not.toBeInTheDocument();
  });

  it("simulates calling a contact and switches to FriendChat", async () => {
    renderComponent();

    const unlockButton = screen.getByRole("button", { name: /Press here to unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    const contactButton = screen.getByText(/Fernando Alonso/i);
    fireEvent.click(contactButton);

    // Should show calling screen
    await waitFor(() => {
      expect(screen.getByText(/Calling Fernando Alonso/i)).toBeInTheDocument();
    });

    // After delay it should switch to FriendChat mock
    await waitFor(() => {
      expect(screen.getByTestId("mocked-friendchat")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("locks the phone again when clicking close in contacts", async () => {
    renderComponent();

    const unlockButton = screen.getByRole("button", { name: /Press here to unlock/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    const closeButton = screen.getAllByRole("button")[0]; // First IconButton is close
    fireEvent.click(closeButton);

    expect(screen.getByText(/Your phone is locked now/i)).toBeInTheDocument();
  });
});
