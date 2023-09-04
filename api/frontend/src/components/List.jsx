function List(props){
    function handleClick(){
  props.deletion(props.id)
}
  return (
      <div className="temp">
        <h1 >  Temperature: {props.temp} </h1>
        <p > Humidity: {props.humidity}</p>
        <button onClick={handleClick}>Delete</button>
      </div>
  )
}

export default List