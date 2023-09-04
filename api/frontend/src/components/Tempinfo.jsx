import {useState, useEffect} from "react"
import axios from "axios"
import  List from "./List"

function TempInfo() {
    const [temp , setNewTemp] = useState(null)
    const [formTemp, setFormTemp] = useState({
          temp: "",
          humidity: ""
          })

          useEffect(() => {
            getTempInfo()
              } ,[])
    
    function getTempInfo() {
        axios({
            method: "GET",
            url:"/tempinfo/",
          }).then((response)=>{
            const data = response.data
            setNewTemp(data)
          }).catch((error) => {
            if (error.response) {
              console.log(error.response);
              console.log(error.response.status);
              console.log(error.response.headers);
              }
          })}
          function addTemp(event) {
            axios({
              method: "POST",
              url:"/tempinfo/",
              data:{
                temp: formTemp.temp,
                humidity: formTemp.humidity
               }
            })
            .then((response) => {
              getTempInfo()
            })
        
            setFormTemp(({
              temp: "",
              humidity: ""}))
        
            event.preventDefault()
        }
        function DeleteTemp(id) {
            axios({
              method: "DELETE",
              url:`/tempinfo/${id}/`,
            })
            .then((response) => {
              getTempInfo()
            });
        }
        function handleChange(event) { 
            const {value, name} = event.target
            setFormTemp(prevTemp => ({
                ...prevTemp, [name]: value})
            )}
    
            return (
                <div className=''>
                
                      <form className="add-temp">
                          <input onChange={handleChange} text={formTemp.temp} name="temp" placeholder="Temperature" value={formTemp.temp} />
                          <textarea onChange={handleChange} name="humidity" placeholder="Humidity" value={formTemp.humidity} />
                          <button onClick={addTemp}>Create Post</button>
                      </form>
                          { temp && temp.map(temp => <List
                          key={temp.id}
                          id={temp.id}
                          temp={temp.temp}
                          humidity={temp.humidity} 
                          deletion ={DeleteTemp}
                          />
                          )}
                
                    </div>
                  );
}

export default TempInfo
        
        
      

