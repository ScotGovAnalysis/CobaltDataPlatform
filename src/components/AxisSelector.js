import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown as DropDownIcon } from '@mui/icons-material';

const AxisSelector = ({ axis, setAxis, columns, label, disabledAxis, includeCount }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<DropDownIcon />}
      >
        {label}: {axis}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {columns.map((column) => (
          <MenuItem
            key={column}
            onClick={() => {
              setAxis(column);
              setAnchorEl(null);
            }}
            disabled={column === disabledAxis}
          >
            {column}
          </MenuItem>
        ))}
        {includeCount && (
          <MenuItem
            onClick={() => {
              setAxis('count');
              setAnchorEl(null);
            }}
            disabled={'count' === disabledAxis}
          >
            Count
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default AxisSelector;