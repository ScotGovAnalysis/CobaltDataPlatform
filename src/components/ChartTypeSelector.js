import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown as DropDownIcon } from '@mui/icons-material';

const ChartTypeSelector = ({ chartType, setChartType, chartTypes }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={chartTypes.find(c => c.type === chartType)?.icon}
        endIcon={<DropDownIcon />}
      >
        {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {chartTypes.map(({ type, icon }) => (
          <MenuItem
            key={type}
            onClick={() => {
              setChartType(type);
              setAnchorEl(null);
            }}
          >
            {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ChartTypeSelector;