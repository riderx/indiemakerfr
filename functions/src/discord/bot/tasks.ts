import {firestore} from "firebase-admin";
import dayjs from "dayjs";
import {sendTxtLater} from "./utils";
import {updateUser, User, getUsersById} from "./user";

import {sendToWip, updateToWip} from "./wip";
import {sendToMakerlog} from "./makerlog";
import {getAllProjects, getProjectById, Project, updateProject} from "./project";
import {Interaction, ApplicationCommandInteractionDataOption} from "./create_command";

enum TaskStatus {
  TODO = "A faire",
  DONE = "Fait",
}
interface Task {
  id?: string,
  content: string,
  status: TaskStatus,
  doneAt?: string,
  wipId?: string,
  makerlogHook?: string,
  createdAt: string,
  updatedAt: string,
}
const taskPublicKey = ["id", "content", "status", "doneAt", "createdAt"];
// const taskProtectedKey = ["id", "wipId", "makerlogHook", "createdAt", "updatedAt"];

const createProjectTask = async (user: User, projectId: string, task: Partial<Task>): Promise<firestore.DocumentReference<firestore.DocumentData>> => {
  try {
    const done = task.status === "A faire" ? false : true;
    if (user?.makerlogHook && task?.content) {
      task.makerlogHook = await sendToMakerlog(user.makerlogHook, task.content, done);
    }
    if (user?.wipApiKey && task?.content) {
      task.wipId = await sendToWip(user.wipApiKey, task.content, done);
    }
  } catch (err) {
    console.error("createProjectTask", err);
  }
  return firestore().collection(`discord/${user.userId}/projects/${projectId}/tasks`).add({...task, createdAt: dayjs().toISOString()});
};

const deleteProjectTask = async (userId: string, projectId: string, taskId:string): Promise<firestore.WriteResult> => {
  return firestore().collection(`discord/${userId}/projects/${projectId}/tasks`).doc(taskId).delete();
};

const updateProjectTask = async (userId: string, projectId: string, taskId:string, task: Partial<Task>): Promise<firestore.WriteResult> => {
  try {
    const user = await getUsersById(userId);
    const done = task.status === "A faire" ? false : true;
    if (task?.makerlogHook && task?.content) {
      task.makerlogHook = await sendToMakerlog(task.makerlogHook, task.content, done);
    }
    if (user?.wipApiKey && task?.wipId && task?.content) {
      task.wipId = await updateToWip(user.wipApiKey, task.wipId, task.content, done);
    }
  } catch (err) {
    console.error("updateProjectTask", err);
  }
  return firestore().collection(`discord/${userId}/projects/${projectId}/tasks`).doc(taskId).update({...task, updatesAt: dayjs().toISOString()});
};

const getAllProjectsTasks = async (userId: string, projectId: string): Promise<{tasks: Task[], total: number}> => {
  try {
    const documents = await firestore().collection(`discord/${userId}/projects/${projectId}/tasks`).get();
    const tasks: Task[] = [];
    documents.docs
        .map((doc) => {
          const data = (doc.data() as Task);
          if (data !== undefined) {
            tasks.push({id: doc.id, ...data});
          }
        });
    return {tasks, total: tasks.length};
  } catch (err) {
    console.error("getAllProjectsTasks", err);
    return {tasks: [], total: 0};
  }
};
const transformKey = (key: string): string => {
  switch (key) {
    case "contenue":
      return "content";
    default:
      return key;
  }
};

const taskAdd = async (interaction: Interaction, options:ApplicationCommandInteractionDataOption[], userId:string): Promise<void> => {
  let projectId = "";
  const task: Partial<Task> = {
    status: TaskStatus.DONE,
  };
  options.forEach((element: ApplicationCommandInteractionDataOption) => {
    if (element.name === "hashtag" && element.value) {
      projectId = element.value;
    } else if (taskPublicKey.includes(transformKey(element.name))) {
      (task as any)[transformKey(element.name)] = element.value;
    }
  });
  const curUser = await getUsersById(userId);
  if (curUser) {
    const lastDay = dayjs();
    lastDay.set("minute", 0);
    lastDay.set("hour", 0);
    lastDay.set("second", 0);
    return Promise.all([
      sendTxtLater(`La tache:\n${task["content"]}\nA été ajouté au projet #${projectId}, 🎉!`, interaction.application_id, interaction.token),
      getProjectById(userId, projectId).then(async (curProject) => {
        const curTasks = await getAllProjectsTasks(userId, projectId);
        const updatedProject: Partial<Project> = {
          taches: curTasks.total + 1,
        };
        if (!curProject) return Promise.reject(Error("Projet introuvable"));
        if (curProject.lastTaskAt && dayjs(curProject.lastTaskAt).isBefore(lastDay) || !curProject.lastTaskAt) {
          updatedProject.strikes = curUser.strikes ? curUser.strikes + 1 : 1;
          updatedProject.lastTaskAt = dayjs().toISOString();
        }
        return updateProject(userId, projectId, updatedProject);
      }),
      createProjectTask(curUser, projectId, task),
      getTotalTaskByUser(userId).then((superTotal) => {
        const updatedUser: Partial<User> = {
          taches: superTotal + 1,
        };
        if (curUser.lastTaskAt && dayjs(curUser.lastTaskAt).isBefore(lastDay) || !curUser.lastTaskAt) {
          updatedUser.strikes = curUser.strikes ? curUser.strikes + 1 : 1;
          updatedUser.lastTaskAt = dayjs().toISOString();
        }
        return updateUser(userId, updatedUser);
      }),
    ]).then(() => Promise.resolve());
  } else {
    return sendTxtLater("Le Maker ou le projet est introuvable 🤫!", interaction.application_id, interaction.token);
  }
};

const taskEdit = async (interaction: Interaction, options:ApplicationCommandInteractionDataOption[], userId:string): Promise<void> => {
  let projectId = "";
  const task: Partial<Task> = {
    status: TaskStatus.DONE,
    updatedAt: dayjs().toISOString(),
  };
  let taskId = "";
  options.forEach((element: ApplicationCommandInteractionDataOption) => {
    if (element.name === "hashtag" && element.value) {
      projectId = element.value;
    } else if (element.name === "id" && element.value) {
      taskId = element.value;
    } else if (element.name === "contenue" && element.value) {
      (task as any)[transformKey(element.name)];
    } else if (element.name === "status" && element.value) {
      task["status"] = element.value as TaskStatus;
    }
  });
  return Promise.all([
    sendTxtLater(`La tache:\n${taskId}: ${task["content"]}\n ${taskId}\nA été mise a jours dans le projet #${projectId}, 🎉!`, interaction.application_id, interaction.token),
    updateProjectTask(userId, projectId, taskId, task),
  ]).then(() => Promise.resolve());
};

const tasksView = async (interaction: Interaction, option:ApplicationCommandInteractionDataOption, userId:string): Promise<void> => {
  const projectId = option.value;
  if (projectId) {
    const allTaks = await getAllProjectsTasks(userId, projectId);
    let taskInfos = `Tu a fait un total de ${allTaks.total} sur ce projet, BRAVO 🎉!\n\nVoici La liste:\n`;
    allTaks.tasks.forEach((element: Task) => {
      taskInfos += `${element.content} . Crée le ${dayjs(element.createdAt).format("DD/MM/YYYY")}\n`;
    });
    return sendTxtLater(taskInfos, interaction.application_id, interaction.token);
  } else {
    return sendTxtLater("Donne moi un projet !", interaction.application_id, interaction.token);
  }
};

const getTotalTaskByUser = async (userId: string): Promise<number> => {
  const projects = await getAllProjects(userId);
  return projects.reduce((tt, project) => tt + project.taches, 0);
};

const tasksDelete = async (interaction: Interaction, options:ApplicationCommandInteractionDataOption[], userId:string): Promise<void> => {
  let projectId = "";
  let taskId = "";
  options.forEach((element: ApplicationCommandInteractionDataOption) => {
    if (element.name === "hashtag" && element.value) {
      projectId = element.value;
    } else if (element.name === "id" && element.value) {
      taskId = element.value;
    }
  });
  return Promise.all([
    getTotalTaskByUser(userId).then((superTotal) => {
      const updatedUser: Partial<User> = {
        taches: superTotal - 1,
        lastTaskAt: dayjs().toISOString(),
      };
      return updateUser(userId, updatedUser);
    }),
    getAllProjectsTasks(userId, projectId).then((curTasks) => updateUser(userId, {taches: curTasks.total - 1})),
    deleteProjectTask(userId, projectId, taskId),
    sendTxtLater(`Tu as supprimé la tache ${taskId} !`, interaction.application_id, interaction.token),
  ]).then(() => Promise.resolve());
};

export const taskFn = async (interaction: Interaction, option: ApplicationCommandInteractionDataOption, userId:string): Promise<void> => {
  if (option.name === "ajouter" && option.options && option.options.length > 0) {
    return taskAdd(interaction, option.options, userId);
  } if (option.name === "liste" && option.options && option.options.length > 0) {
    return tasksView(interaction, option.options[0], userId);
  } if (option.name === "modifier" && option.options && option.options.length > 0) {
    return taskEdit(interaction, option.options, userId);
  } if (option.name === "supprimer" && option.options && option.options.length > 0) {
    return tasksDelete(interaction, option.options, userId);
  }
};
