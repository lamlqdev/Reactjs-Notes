import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store/index.ts";

// createSelector nhận vào 2 tham số callback như trên có tác dụng tạo một selector có khả năng "memoization" (tối ưu hóa bằng cách nhớ kết quả nếu input không thay đổi).
// Tham số đầu là hàm chọn ra state cần thiết từ RootState,
// Tham số thứ hai là hàm nhận kết quả của hàm đầu và xử lý (ở đây chỉ đơn giản là trả lại giá trị đó).

export const selectIsAuthenticated = createSelector(
  (state: RootState) => state.auth.isAuthenticated, // selector lấy giá trị isAuthenticated từ state
  (isAuthenticated) => isAuthenticated // hàm chuyển đổi (identity ở đây, không thay đổi giá trị)
);

export const selectUser = createSelector(
  (state: RootState) => state.auth.user, // selector lấy giá trị user từ state
  (user) => user // hàm chuyển đổi (identity ở đây, không thay đổi giá trị)
);
