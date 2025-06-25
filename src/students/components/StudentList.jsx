import {StudentFilter} from "./StudentFilter.jsx";
import {StudentTable} from "./StudentTable.jsx";
import StudentFAB from "./StudentFAB.jsx";

export const StudentList = ({isLargeScreen}) => {
    return (
        <>
            <StudentFilter isLargeScreen={isLargeScreen}/>
            <StudentTable />
            <StudentFAB />
        </>
    );
};
