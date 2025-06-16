import {render, screen} from "@testing-library/react";
import Login from "../src/pages/Login/Login";
import {describe, it, expect} from "vitest";
import {Provider} from "react-redux";
import store from "../src/redux/store";
import {BrowserRouter} from "react-router-dom";

describe("Login Component", () => {
  it("should render the login form with place holder of phone number input field", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByPlaceholderText("0123456789")).toBeInTheDocument();
  });

  it("should render the login form with place holder of password input field", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByPlaceholderText("***")).toBeInTheDocument();
  });
});

// import {fireEvent, render, screen, waitFor} from "@testing-library/react";
// import Login from "../src/pages/Login/Login";
// import {describe, it, expect} from "vitest";
// import {Provider} from "react-redux";
// import store from "../src/redux/store";
// import {BrowserRouter} from "react-router-dom";

// const testCases = [
//   ["0799995824", "Ngothanhdat@4002", "Invalid phone number or password."],
//   ["0799995822", "Ngothanhdat@4002", "Invalid phone number or password."],
//   ["0799995821", "Ngothanhdat@4002", "Invalid phone number or password."],
// ];

// describe("Login Functionality - Invalid Login", () => {
//   it.each(testCases)(
//     "should show error message for phone %s and password %s when login fails",
//     async (phoneNumber, password, expectedMessage) => {
//       render(
//         <Provider store={store}>
//           <BrowserRouter>
//             <Login />
//           </BrowserRouter>
//         </Provider>
//       );

//       fireEvent.change(screen.getByPlaceholderText("0123456789"), {
//         target: {value: phoneNumber},
//       });
//       fireEvent.change(screen.getByPlaceholderText("***"), {
//         target: {value: password},
//       });
//       fireEvent.click(screen.getByText("Login"));

//       await waitFor(() => {
//         const alertMessage = screen.getByTestId("login-status");
//         console.log("Actual Message:", alertMessage.textContent);
//         console.log("Expected Message:", expectedMessage);
//         expect(alertMessage).toHaveTextContent(expectedMessage); // Kiểm tra thông báo lỗi
//       });
//     }
//   );
// });
