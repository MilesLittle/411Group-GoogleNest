import * as React from 'react'; 
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import  TextField  from '@mui/material/TextField';


const ChangeLog = ({open, onClose}) =>  {  

  /*
// Open and close the buttons for the modal 
const [open, setOpen] = React.useState(props.open);


const OpenModal = () => {
  setOpen(true); 
}

const CloseModal = () => {
  setOpen(false); 
}
*/

// Time options 
const timeValues = [
  {
    value: "minutes", 
    label: "minutes", 
  }, 
  {
    value: "hours",  
    label: "hours"
  }, 
  
  {
    value: "days", 
    label: "days",
  }
]

/*
useEffect(() => {
  setOpen(prevState => ({ ...prevState, open: props.open }));
}, [props.open]);
*/


// React Stuff 
    return (
    <>
      <div style={{textAlign: 'center'}}>
          {/*<Button onClick={OpenModal} color="primary" variant="contained"> Test Button </Button>*/}

          <Dialog open={open} onClose={onClose}>
            <DialogTitle> Thermostat 1 Log Setting </DialogTitle> 
              <DialogContent>  
                <DialogContentText> Set the Log: </DialogContentText>
                  <TextField
                    id="outlined-number"
                    label="Number"
                    type="number"
                    InputLabelProps={{shrink: true,}}
                  >
                    
                  </TextField>

                  <TextField
                    id="select-time"
                    select 
                    label = "Select"
                    defaultValue="Minutes"
                    helperText="Please Select a time"  
                  >
                    {timeValues.map((option) => (
                        <MenuItem key={option.value} value={option.value}> 
                          {option.label}
                        </MenuItem>
                    ))}
                  </TextField>
                </DialogContent>

            <DialogActions> 
              <Button onClick={onClose} color="secondary"> Cancel </Button>
              <Button onClick={onClose} color="primary"> Save </Button>
            </DialogActions>
          </Dialog>
        </div>
    </>     
  ); 
}

export default ChangeLog 
