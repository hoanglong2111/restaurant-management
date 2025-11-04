import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navbar links', () => {
  render(<App />);
  const homeLink = screen.getByText(/Trang Chủ/i);
  expect(homeLink).toBeInTheDocument();

  const menuLink = screen.getByText(/Thực Đơn/i);
  expect(menuLink).toBeInTheDocument();

  const reservationsLink = screen.getByText(/Đặt Chỗ/i);
  expect(reservationsLink).toBeInTheDocument();

  const tablesLink = screen.getByText(/Bàn/i);
  expect(tablesLink).toBeInTheDocument();

  const loginLink = screen.getByText(/Đăng Nhập/i);
  expect(loginLink).toBeInTheDocument();
});
