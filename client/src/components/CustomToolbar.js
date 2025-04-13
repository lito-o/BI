import React from "react";
import { GridToolbarQuickFilter, GridToolbarContainer } from "@mui/x-data-grid";

const CustomToolbar = () => (
  <GridToolbarContainer sx={{ mx: 1, my: 1 }}>
    <GridToolbarQuickFilter
      quickFilterParser={(searchInput) =>
        searchInput.split(" ").filter((word) => word.length > 0)
      }
      debounceMs={300}
    />
  </GridToolbarContainer>
);

export default CustomToolbar;