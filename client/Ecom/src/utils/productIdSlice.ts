import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProductIdState {
  value: string | null;
}

const initialState: ProductIdState = {
  value: null,
};

const productIdSlice = createSlice({
  name: 'activeId',
  initialState, // Starts with no ID selected
  reducers: {
    setId: (state, action) => {
      state.value = action.payload; // Updates the global ID
    },
    clearId: (state) => {
      state.value = null; // Resets the ID
    },
  },
});

export const { setId, clearId } = productIdSlice.actions;
export default productIdSlice.reducer;
