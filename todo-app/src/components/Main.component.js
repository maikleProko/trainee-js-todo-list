import {Component} from "react";
import "../App.css"
import "../Modal.css"


export default class MainComponent extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            /* Переменные: currentId, currentName, currentDate, currentStatus
             отвечают за текущую заметку, которая может быть изменена или удалена: */
            currentId: 0,
            currentName: "",
            currentDate: "",
            currentStatus: "",
            currentTodo: {},
            //todos - массив имеющихся TODO:
            todos:[]
        };
        this.mergeTodos = this.mergeTodos.bind(this);
    }
    
    componentDidMount() {
        this.mergeTodos()
    }
    
    mergeTodos() {
        //GET-запрос получения массива TODO с сервера:
        fetch('/todos')
            .then(response => response.json())
            .then(resTodos => {
                this.setState({todos: resTodos})
                let isFound = false
                //Определение текущего TODO:
                for(let i = 0; i < resTodos.length; i++) {
                    if(resTodos[i].id === this.state.currentId) {
                        isFound = true
                        this.setState({currentName: resTodos[i].name})
                        this.setState({currentDate: resTodos[i].date})
                        this.setState({currentStatus: resTodos[i].status})
                    }
                }
                //Случай, если текущий TODO не найден - определение нового
                if(!isFound) {
                    if(this.state.currentId>resTodos.length) {
                        this.state.currentId = resTodos.length;
                    }
                    while((resTodos[this.state.currentId] === undefined)&&(this.state.currentId>0)) {
                        this.state.currentId--
                    }
                    this.setState({currentName: resTodos[this.state.currentId].name})
                    this.setState({currentDate: resTodos[this.state.currentId].date})
                    this.setState({currentStatus: resTodos[this.state.currentId].status})
                    //Если TODO нет, то переменнные currentName, currentDate, currentStatus обнуляются
                    if(resTodos.length === 0) {
                        this.setState({currentName: ""})
                        this.setState({currentDate: ""})
                        this.setState({currentStatus: ""})
                    }
                }
            })
    }
    
    showTodos() {
        //Вывод списка TODO
        return this.state.todos.map((todo, i) => {
            let showId = todo.id
            //Сокращение имени TODO, если оно не помещается панель выбора заметок
            if(todo.name.length>21) {
                todo.name = todo.name.substr(0, 21) +"..."
            }
            //Определение цвета TODO, в зависимости от его статуса
            let showClassName = "Button-select-list"
            if(todo.id === this.state.currentId) {
                showId = "selected"
                if(todo.status === "В процессе выполнения") {
                    showId = "selected-in-process"
                }
                if(todo.status === "Выполнено") {
                    showId = "selected-complete"
                }
            }
            if(todo.status === "В процессе выполнения") {
                showClassName = "Button-select-list-in-process"
            }
            if(todo.status === "Выполнено") {
                showClassName = "Button-select-list-complete"
            }

            return (
                <tr>
                    <a className={showClassName}
                        id ={showId}
                        onClick={()=>{
                            // Изменение текущего TODO при выборе одного из существующих
                            this.setState({currentId: todo.id})
                            this.setState({currentName: todo.name})
                            this.setState({currentDate: todo.date})
                            this.setState({currentStatus: todo.status})
                            this.showTodos()
                        }}>{todo.name}</a>
                    </tr>
                )
        });
    }
    
    showEditField(showTodo) {
        //Вывод области редактирования TODO
        if(this.state.todos.length>0) {
            return (
                <td className="Parent-table-td">
                    <table className="Edit-field">
                        <table className="Edit-field-margins">
                            <tr valign="top" className="Legacy-editing">
                                <p className="Edit-title">
                                    Редактирование {showTodo.name}
                                </p>
                                {/* Редактирование имени TODO */}
                                <p className="Edit-param-name">
                                    Наименование заметки:
                                </p>
                                <input value={this.state.currentName}
                                       onChange={(e) => {
                                           this.setState({currentName: e.target.value})
                                       }}
                                       className="Edit-input"
                                />

                                {/* Редактирование даты и времени TODO */}
                                <p className="Edit-param-name">
                                    Дата и время:
                                </p>
                                <input value={this.state.currentDate}
                                       onChange={(e) => {
                                           this.setState({currentDate: e.target.value})
                                       }}
                                       className="Edit-input"
                                       type="date"
                                />

                                {/* Редактирование статуса TODO */}
                                <p className="Edit-param-name">
                                    Статус:
                                </p>
                                <select
                                    value={this.state.currentStatus}
                                    className="Edit-select"
                                    onChange={(e) => {
                                        this.setState({currentStatus: e.target.value})
                                    }}
                                    >
                                    <option>Ожидает</option>
                                    <option>В процессе выполнения</option>
                                    <option>Выполнено</option>
                                </select>
                            </tr>
                            <tr valign="bottom">
                                <td/>
                                <td>
                                    <table className="Legacy-edit-table-buttons">
                                        <td>
                                            {/* Кнопка удаления TODO с вызовом модального окна совершенного действия */}
                                            <label>
                                                <a className="Active-button-danger"
                                                   tabIndex="2"
                                                   onClick = {()=>{
                                                       //Удаление заметки с отправкой DELETE-запроса на сервер
                                                       let sendTodo = {}
                                                       sendTodo.id = this.state.currentId
                                                       sendTodo.name = this.state.currentName
                                                       sendTodo.date = this.state.currentDate
                                                       sendTodo.status = this.state.currentStatus
                                                       fetch('/todos', {
                                                           method: 'DELETE',
                                                           headers: {
                                                               'Content-Type': 'application/json;charset=utf-8'
                                                           },
                                                           body: JSON.stringify(sendTodo)
                                                       }).then(()=>{
                                                           this.mergeTodos()
                                                       })
                                                   }}>
                                                    Удалить
                                                </a>
                                                <input type="checkbox"/>
                                                {/* Вызов модального окна удаления */}
                                                <div className="confirm-modal">
                                                    <div>
                                                        <p align="center">Удалено</p>
                                                        <a className="Active-button-success">OK</a>
                                                    </div>
                                                </div>
                                            </label>
                                        </td>
                                        <td>
                                            {/* Кнопка cохранения TODO с вызовом модального окна совершенного действия */}
                                            <label>
                                                <a className="Active-button"
                                                   tabIndex="3"
                                                   onClick={()=>{
                                                       //Сохранение заметки с отправкой PUT-запроса на сервер
                                                       let sendTodo = {}
                                                       sendTodo.id = this.state.currentId
                                                       sendTodo.name = this.state.currentName
                                                       sendTodo.date = this.state.currentDate
                                                       sendTodo.status = this.state.currentStatus
                                                       fetch('/todos', {
                                                           method: 'PUT',
                                                           headers: {
                                                               'Content-Type': 'application/json;charset=utf-8'
                                                           },
                                                           body: JSON.stringify(sendTodo)
                                                       }).then(()=>{
                                                           this.mergeTodos()
                                                       })
                                                   }}>
                                                    Сохранить
                                                </a>
                                                <input type="checkbox"/>
                                                {/* Вызов модального окна сохранения */}
                                                <div className="confirm-modal">
                                                    <div>
                                                        <p align="center">Сохранено</p>
                                                        <a className="Active-button-success">OK</a>
                                                    </div>
                                                </div>
                                            </label>
                                        </td>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </table>
                </td>
            )
        } else {
            return (
                <></>
            )
        }
    }
    
    showMain(showTodo) {
        //Вывод основной области
        if(this.state.todos.length>0) {
            //Случай, если имеются TODO
            return (
                <>
                    <table className="Parent-table-text">
                        <td valign="top" className="Td-select-list">
                            <table className="Legacy-table">
                                {/* Вывод списка TODO*/}
                                <tr valign="top" className="Tr-select-list">
                                    <table>
                                        {this.showTodos()}
                                    </table>
                                </tr>
                                {/* Вывод списка TODO*/}
                                <tr valign="bottom">
                                    <table className="Legacy-table-buttons">
                                        <tr>
                                            <a className="Active-button"
                                               tabIndex="1"
                                               onClick={()=>{
                                                   fetch('/todos', {
                                                       method: 'POST',
                                                       headers: {
                                                           'Content-Type': 'application/json;charset=utf-8'
                                                       }
                                                   }).then(()=>{
                                                       this.componentDidMount()
                                                       this.setState({currentId: this.state.todos.length})
                                                   });
                                               }}>
                                                Добавить
                                            </a>
                                        </tr>
                                    </table>
                                </tr>
                            </table>
                        </td>
                        {/* Вывод области редактирования TODO*/}
                        {this.showEditField(showTodo)}
                    </table>
                </>
            )
        } else {
            //Случай, если не имеются TODO
            return (
                <div className="Parent-div-text" align="center">
                    {/* Вывод текста и кнопки создания TODO*/}
                    <p>
                        На данный момент не создано ни одной заметки, создайте первую
                    </p>
                    <a className="Active-button"
                       tabIndex="1"
                       onClick={()=>{
                           fetch('/todos', {
                               method: 'POST',
                               headers: {
                                   'Content-Type': 'application/json;charset=utf-8'
                               }
                           }).then(()=>{
                               this.componentDidMount()
                           });
                       }}>
                        Добавить
                    </a>
                </div>
            )
        }
    }
    
    render() {
        //Вывод страницы полностью (основной области и нав.бара)
        /* Определение showTodo для показа текущего редактируемого TODO, при этом
         значения showTodo не меняются, в отличии от CurrentId, CurrentName, CurrentDate, CurrentStatus */
        let showTodo = {}
        for(let i = 0; i < this.state.todos.length; i++) {
            if(this.state.todos[i].id == this.state.currentId) {
                showTodo = this.state.todos[i];
            }
        }
        return(
            <div className="Start">
                <header className="App-noheader">
                    {/* Вывод нав.бара*/}
                    <div className="Navbar">
                        <table className="Navbar-table" >
                            {/* Вывод наименования*/}
                            <td className="Navbar-left-td" height="10px">
                                <p className="Navbar-logo">
                                    TODO
                                </p>
                            </td>
                            {/* Вывод кнопки "Очистить"*/}
                            <td className="Navbar-right-td" height="10px">
                                <table className="Navbar-list">
                                    <td className="Navbar-list-td"/>
                                    <td>
                                        <label>
                                            {/* Кнопка очистки TODO с вызовом модального окна совершенного действия */}
                                            {/* В данном случае, удаляются все имеющиеся TODO */}
                                            <a className="Active-button"
                                               tabIndex="0"
                                               onClick = {()=>{
                                                   //Сохранение заметки с отправкой PUT-запроса на сервер
                                                   let sendTodo = {}
                                                   fetch('/clean', {
                                                       method: 'DELETE',
                                                       headers: {
                                                           'Content-Type': 'application/json;charset=utf-8'
                                                       },
                                                       body: JSON.stringify(sendTodo)
                                                   }).then(()=>{
                                                       this.mergeTodos()
                                                   })
                                               }}>
                                                Очистить
                                            </a>
                                            <input type="checkbox"/>
                                            {/* Вызов модального окна очистки */}
                                            <div className="confirm-modal">
                                                <div>
                                                    <p align="center">Все заметки были удалены</p>
                                                    <a className="Active-button-success">OK</a>
                                                </div>
                                            </div>
                                        </label>
                                    </td>
                                </table>
                            </td>
                        </table>
                    </div>
                    {/* Вывод основной области*/}
                    {this.showMain(showTodo)}
                </header>
            </div>
        );
    }
}
