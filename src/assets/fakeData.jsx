import {Group, CalendarToday, Person, Quiz, Checklist, Chat, Article} from '@mui/icons-material';


export const menuItems = [
    {
        id: 1,
        label: 'Ciclos',
        path: '/cycles',
        icon: <CalendarToday/>,
    },
    {
        id: 2,
        label: 'Alumnos',
        path: '/students',
        icon: <Person/>,
    },
    {
        id: 3,
        label: 'Usuarios',
        path: '/users',
        icon: <Group/>,
    },
    {
        id: 4,
        label: 'Exámenes',
        path: '/exams',
        icon: <Quiz/>,
    },
    {
        id: 5,
        label: 'Asistencia',
        path: '/attendance',
        icon: <Checklist/>,
    },
    {
        id: 6,
        label: 'Conversaciones',
        path: '/talks',
        icon: <Chat/>,
    },
    {
        id: 7,
        label: 'Reportes',
        path: '/reports',
        icon: <Article/>,
    }
];



export const exams = [
    {id:1,name:"Examen 1", date:"2025-06-02", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
    {id:2,name:"Examen 2", date:"2025-06-09", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
    {id:3,name:"Examen 3", date:"2025-06-16", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
    {id:4,name:"Examen 4", date:"2025-06-23", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
]


export const areas = [
    {id:1,name:'Ciencias'},
    {id:2,name:'Letras'},
    {id:3,name:'Arquitectura'},
]


export const studentStates = [
    {id:1,name:'Activo'},
    {id:2,name:'Inactivo'},
]