import merge from 'lodash/merge';
import union from 'lodash/union';
import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSES: {
      // @TODO WHAT ARE YOU DOING? WE DONT NEED MERGE
      const updatedCourses = merge({ ...state.byId }, action.byId);
      const updatedIds = union([...state.allIds], [...action.allIds]);
      return {
        ...state,
        byId: updatedCourses,
        allIds: updatedIds,
      };
    }
    case actionTypes.ADD_COURSE: {
      // We should probably check to make sure thid id exsits?
      const updatedCourses = { ...state.byId };
      updatedCourses[action.course._id] = action.course;
      return {
        ...state,
        byId: updatedCourses,
      };
    }
    case actionTypes.LOGOUT: {
      return initialState;
    }
    case actionTypes.CREATED_COURSE: {
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.course._id]: action.course,
        },
        allIds: [action.course._id, ...state.allIds],
      };
    }
    case actionTypes.REMOVE_COURSE: {
      const updatedIds = state.allIds.filter((id) => id !== action.courseId);
      const updatedById = { ...state.byId };
      delete updatedById[action.courseId];
      return {
        ...state,
        byId: updatedById,
        allIds: updatedIds,
      };
    }
    case actionTypes.UPDATED_COURSE: {
      const updatedCourse = { ...state.byId[action.courseId] };
      const fields = Object.keys(action.body);
      fields.forEach((field) => {
        updatedCourse[field] = action.body[field];
      });
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: updatedCourse,
        },
      };
    }
    case actionTypes.ADD_COURSE_ACTIVITIES: {
      const updatedCourses = { ...state.byId };
      updatedCourses[action.courseId].activities = updatedCourses[
        action.courseId
      ].activities.concat(action.activityIdsArr);
      return {
        ...state,
        byId: updatedCourses,
      };
    }
    case actionTypes.REMOVE_COURSE_ACTIVITIES: {
      const updatedById = { ...state.byId };
      const updatedCourseActivities = updatedById[
        action.courseId
      ].activities.filter((id) => id !== action.activityId);
      updatedById[action.courseId].rooms = updatedCourseActivities;
      return {
        ...state,
        byId: updatedById,
      };
    }
    case actionTypes.ADD_COURSE_ROOMS: {
      const updatedCourses = { ...state.byId };
      // ONly add unique ids, dont add dups
      const roomIds = action.roomIdsArr.filter(
        (roomId) => updatedCourses[action.courseId].rooms.indexOf(roomId) <= 0
      );
      updatedCourses[action.courseId].rooms = updatedCourses[
        action.courseId
      ].rooms.concat(roomIds);
      return {
        ...state,
        byId: updatedCourses,
      };
    }
    case actionTypes.REMOVE_COURSE_ROOM: {
      const updatedById = { ...state.byId };
      const updatedCourseRooms = updatedById[action.courseId].rooms.filter(
        (id) => id !== action.roomId
      );
      updatedById[action.courseId].rooms = updatedCourseRooms;
      return {
        ...state,
        byId: updatedById,
      };
    }
    case actionTypes.ADD_COURSE_MEMBER: {
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: {
            ...state.byId[action.courseId],
            members: [...state.byId[action.courseId].members, action.newMember],
          },
        },
      };
    }
    case actionTypes.ADD_ROOM_TO_COURSE_ARCHIVE: {
      const courseToUpdate = { ...state.byId[action.courseId] };
      // create a default structure if one doesn't exist
      const prevArchivedRooms =
        courseToUpdate.archive && courseToUpdate.archive.rooms
          ? [...courseToUpdate.archive.rooms, action.roomId]
          : [action.roomId];
      courseToUpdate.archive.rooms = prevArchivedRooms;

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: { ...courseToUpdate },
        },
      };
    }
    case actionTypes.REMOVE_ROOM_FROM_COURSE_ARCHIVE: {
      const courseToUpdate = { ...state.byId[action.courseId] };
      const rooms = courseToUpdate.archive.rooms.filter(
        (roomId) => roomId !== action.roomId
      );

      courseToUpdate.archive.rooms = rooms;

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: { ...courseToUpdate },
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
