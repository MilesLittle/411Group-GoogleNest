import * as React from 'react'; 
import Button from '@mui/material/Button';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const ChangeLog = () =>  {  

// Open and close the button for the modal 
const [open, setOpen] = React.useState(false);

const OpenModal = () => {
  setOpen(true); 
}

const CloseModal = () => {
  setOpen(false); 
}

// get the number and time -> days minutes hours 

// React Stuff 
    return (
    <>
      <div style={{textAlign: 'center'}}>
          <Button onClick={OpenModal} color="primary" variant="contained"> Test Button </Button>

          <Dialog open={open} onClose={CloseModal}>
            <DialogTitle> Thermostat 1 Log Setting </DialogTitle> 
              <DialogContent>  
                <DialogContentText> Test </DialogContentText>



                </DialogContent>

            <DialogActions> 
              <Button onClick={CloseModal} color="secondary"> Cancel </Button>
              <Button onClick={CloseModal} color="primary"> Save </Button>
            </DialogActions>
          </Dialog>
        </div>
    </>     
  ); 
}

export default ChangeLog 