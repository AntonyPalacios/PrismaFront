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

export const currentUser = {
    name: 'Antony Palacios',
    roles: [
        {id: 1, role: 'Administrador', current: true},
        {id: 2, role: 'Tutor', current: false},
    ]
}

export const users = [
    {id:1, name: 'Antony Palacios',email: 'antonyPalacios@gmail.com',isAdmin: true,isTutor:true,isActive:true},
    {id:2, name: 'Silvia Valle',email: 'svalle@prisma.edu.pe',isAdmin: false,isTutor:true,isActive:true},
    {id:3, name: 'Almendra Gómez',email: 'agomez@gmail.com',isAdmin: false,isTutor:true,isActive:false},
]

export const exams = [
    {id:1,name:"Examen 1", date:"2025-06-02", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
    {id:2,name:"Examen 2", date:"2025-06-09", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
    {id:3,name:"Examen 3", date:"2025-06-16", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
    {id:4,name:"Examen 4", date:"2025-06-23", stage:{id:1,name:"Regular 1", cycle:{id:1, name:"2025 - 2"}}},
]
export const students = [
    {
        id: 1,
        dni:'72498155',
        name: 'Antony Palacios',
        area: {id:1,name:'Ciencias'},
        email: 'AntonyPalacios@gmail.com',
        tutor: {id:1,name:'Silvia Valle'},
        phone:'955110168',
        active: true
    },
    {
        id: 2,
        dni:'72498155',
        name: 'Antony Palacios',
        area: {id:2,name:'Letras'},
        email: 'AntonyPalacios@gmail.com',
        tutor: {id:1,name:'Silvia Valle'},
        phone:'955110168',
        active: true
    },
    {
        id: 3,
        dni:'72498155',
        name: 'Antony Palacios',
        area: {id:3,name:'Arquitectura'},
        email: 'AntonyPalacios@gmail.com',
        tutor: {id:1,name:'Silvia Valle'},
        phone:'955110168',
        active: false
    },
    {
        id: 4,
        dni:'72498155',
        name: 'Antony Palacios',
        area: {id:1,name:'Ciencias'},
        email: 'AntonyPalacios@gmail.com',
        tutor: {id:1,name:'Silvia Valle'},
        phone:'955110168',
        active: true
    },
    {
        id: 5,
        dni:'72498155',
        name: 'Antony Palacios',
        area: {id:1,name:'Ciencias'},
        email: 'AntonyPalacios@gmail.com',
        tutor: {id:1,name:'Silvia Valle'},
        phone:'955110168',
        active: false
    },
]

export const stages = [
    {id:1,name:'Regular 1',initDate:"2025-02-19",endDate:"2025-05-26", cycle:{id:1, name:"2025 - 2"}},
    {id:2,name:'Regular 2',initDate:"2025-02-19",endDate:"2025-05-26", cycle:{id:1, name:"2025 - 2"}},
    {id:3,name:'Regular 3',initDate:"2025-02-19",endDate:"2025-05-26", cycle:{id:1, name:"2025 - 2"}},
    {id:4,name:'Repaso',initDate:"2025-02-19",endDate:"2025-05-26",  cycle:{id:1, name:"2025 - 2"}},
]

export const cycles = [
    {id:1, name:"2025 - 1",initDate:"2025-02-13", endDate:"2025-06-29"},
    {id:2, name:"2025 - 2",initDate:"2025-02-13", endDate:"2025-06-29"},
    {id:3, name:"2026 - 1",initDate:"2025-02-13", endDate:"2025-06-29"},
]

export const areas = [
    {id:1,name:'Ciencias'},
    {id:2,name:'Letras'},
    {id:3,name:'Arquitectura'},
]

export const tutores = [
    {id:1,name:'Silvia Valle'},
    {id:2,name:'Ximena'},
    {id:3,name:'Ana'},
]

export const studentStates = [
    {id:1,name:'Activo'},
    {id:0,name:'Inactivo'},
]