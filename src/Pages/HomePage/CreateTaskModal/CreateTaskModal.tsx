import { useEffect, useState, useContext } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import { ListOfTasksModel } from '../../../Models/ListOfTasksModel';
import './CreateTaskModal.scss';
import { StatusModel } from '../../../Models/StatusModel';
import { ListContext } from '../../../Context/ListContext';
import { createTask } from '../../../Services/TaskService';
import { getListsDataById } from '../../../Services/ListOfTasksService';
import { ToastContext } from '../../../Context/ToastContext';

export default function CreateTaskModal() {

  const listContext = useContext(ListContext);
  const toastContext = useContext(ToastContext);

  // useState for list that user pick while creating task.
  const [chosenList, setChosenList] = useState<ListOfTasksModel>(new ListOfTasksModel());

  // useState for all list's statuses.
  const [allListStatuses, setAllListStatuses] = useState<StatusModel[]>(listContext.currentList.statuses);

  // useState for choosen status.
  const [chosenStatus, setChosenStatus] = useState<StatusModel>(new StatusModel());

  useEffect(() => {
    listContext.fetchAllListsNames();
  }, []);

  const fetchChosenListData = async (listId: number) => {
    const fullListData = await getListsDataById(listId);
    setChosenList(fullListData);
    setAllListStatuses(fullListData.statuses);
  }

  // Works on entering data, transferring them to the method, clearing fields.
  const { register, handleSubmit, reset } = useForm(
    {
      defaultValues: {
        title: "",
        description: ""
      }
    }
  )

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    reset();
  };

  const handleShowCreateModal = () => setShowCreateModal(true);

  const onHandleSubmit = (value: any) => {
    if (chosenStatus.id != 0) {
      const newTask: any = {
        title: value.title,
        description: value.description,
        listOfTasksId: chosenList.id != 0 ? chosenList.id : listContext.currentList.id,
        statusId: chosenStatus.id
      }

      createTask(newTask).then(() => {
        toastContext.setMessage(`Task '${value.title}' was created.`);
        toastContext.setToastState(true);
        listContext.fetchCurrentListData();
      });
      setShowCreateModal(false);
      reset();
      setChosenStatus(new StatusModel());
    }
  }

  return (
    <>
      <Button onClick={handleShowCreateModal} variant="primary">
        <span id='createTaskBtn'>
          Create new task
        </span>
      </Button>
      <Form >
        <Modal
          className='modalContainer'
          show={showCreateModal}
          onHide={handleCloseCreateModal}
          aria-labelledby="contained-modal-title-vcenter"
          centered>
          <Modal.Header>
            <Modal.Title className='modalTitleStyles'>Creating your task...</Modal.Title>
          </Modal.Header>
          <Modal.Body className='modalBodyStyles'>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Title</Form.Label>
              <Form.Control
                placeholder="Input your title here"
                autoFocus
                pattern="^.{2,40}$"
                required={true}
                defaultValue=''
                {...register("title", { required: "Required" })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Input task description here"
                required={true}
                defaultValue=''
                pattern="^.{3,400}$"
                {...register("description", { required: "Required" })}
              />
            </Form.Group>
            <div className='dropdownBtnList'>
              <div id='dropdownNames'> List name:</div>
              <Dropdown id='dropdownBtn'>
                <Dropdown.Toggle variant="secondary" >
                  {listContext.currentList.id != 0 && chosenList.id == 0 ? listContext.currentList.listName : chosenList.id != 0 ? chosenList.listName : "Select list"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {listContext.allListNames.map((list) => (
                    <Dropdown.Item key={list.id} onClick={() => { fetchChosenListData(list.id) }}>{list.listName}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {chosenList.id == 0 && listContext.currentList.id != 0 ?
                <>
                  <div id='dropdownNames'> Status:</div>
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary">
                      {chosenStatus.id != 0 ? chosenStatus.statusName : "Select status"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {listContext.currentList.statuses.map((status: StatusModel) => (
                        <Dropdown.Item
                          key={status.id}
                          onClick={() => { setChosenStatus(status); }}
                        >
                          {status.statusName}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </>
                : null}

              {chosenList.id != 0 ?
                <>
                  <div id='dropdownNames'> Status:</div>
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary">
                      {chosenStatus.id != 0 && chosenStatus.listOfTasksId == chosenList.id ? chosenStatus.statusName : "Select status"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {allListStatuses.map((status) => (
                        <Dropdown.Item
                          key={status.id}
                          onClick={() => {
                            if (status.listOfTasksId == chosenList.id) {
                              setChosenStatus(status);
                            }
                          }}>
                          {status.statusName}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </>
                : null}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreateModal}>
              Close
            </Button>
            <Button type="submit" onClick={handleSubmit(onHandleSubmit)}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </>
  );
}



