import {render, screen} from "@testing-library/react";
import Login from "../src/pages/Login/Login";
import {describe, it, expect} from "vitest";
import {Provider} from "react-redux";
import store from "../src/redux/store";
import {BrowserRouter} from "react-router-dom";

// describe("Login Component", () => {
//   it("should render the login form with place holder of phone number input field", () => {
//     render(
//       <Provider store={store}>
//         <BrowserRouter>
//           <Login />
//         </BrowserRouter>
//       </Provider>
//     );
//     expect(screen.getByPlaceholderText("0123456789")).toBeInTheDocument();
//   });

//   it("should render the login form with place holder of password input field", () => {
//     render(
//       <Provider store={store}>
//         <BrowserRouter>
//           <Login />
//         </BrowserRouter>
//       </Provider>
//     );
//     // Kiểm tra xem input với placeholder "***" (mật khẩu) có được hiển thị không
//     expect(screen.getByPlaceholderText("***")).toBeInTheDocument();
//   });
// });

describe("Login Component", () => {
  it("should render the login form with the place holder of phone number input field", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByPlaceholderText("0123456789")).toBeInTheDocument();
  });
});
