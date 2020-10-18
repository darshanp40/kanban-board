(function () {
    let store = {};
    let editCardId = '';
    const ADD_CARD = 'ADD_CARD';
    const UPDATE_CARD = 'UPDATE_CARD';
    const ADD_MEMBER = 'ADD_MEMBER';
    const PLANNED = 'PLANNED';
    const STARTED = 'STARTED';
    const DONE = 'DONE';

    const modalId = document.getElementById('modal');
    const description = document.getElementById('description');
    const dueDate = document.getElementById('due-date');
    const status = document.getElementById('status');
    const assignee = document.getElementById('assignee');
    const save = document.getElementById('save');

    const addPlanned = document.getElementById('add-planned-task');
    const addStarted = document.getElementById('add-started-task');
    const addDone = document.getElementById('add-done-task');
    const cancel = document.getElementById('cancel');
    const board = document.getElementById('board-container');
    const btnAddMember = document.getElementById('add-member');
    const memberControl = document.getElementById('member-add-control');
    const memberInput = document.getElementById('member-name');
    const memberSave = document.getElementById('member-save');
    const memberCancel = document.getElementById('member-cancel');

    function generateId() {
        return Math.random().toString(36).substring(2) + new Date().getTime().toString(36);
    }

    function createStore(mutator) {
        let state;
        let listeners = [];
        const getState = () => state;
        const subscribe = (listener) => {
            listeners.push(listener);
            return () => {
                listeners = listeners.find((l) => l.id !== listener.id);
            };
        };
        const dispatch = (action) => {
            state = mutator(state, action);
            listeners.forEach((listener) => listener());
        };
        return {
            getState,
            subscribe,
            dispatch,
        };
    }

    function cardMutator(state = [], action) {
        switch (action.type) {
            case ADD_CARD:
                return state.concat([action.details]);
            case UPDATE_CARD:
                const newState = state.map((item) => {
                    if (item.cardId === action.details.cardId) {
                        item = action.details;
                    }
                    return item;
                });
                return newState;
            default:
                return state;
        }
    }

    function memberMutator(state = [], action) {
        switch (action.type) {
            case ADD_MEMBER:
                return state.concat(action.details.length ? [...action.details] : [action.details]);
            default:
                return state;
        }
    }

    function initState(state = {}, action) {
        return {
            cards: cardMutator(state.cards, action),
            members: memberMutator(state.members, action),
        };
    }

    function createAppStore() {
        store = createStore(initState);
    }

    function addListeners() {
        addPlanned.addEventListener('click', function () {
            openModal(PLANNED);
        });
        addStarted.addEventListener('click', function () {
            openModal(STARTED);
        });
        addDone.addEventListener('click', function () {
            openModal(DONE);
        });
        board.addEventListener('dblclick', function (evt) {
            const card = findCard(evt);
            if (card) {
                openModal(card);
            }
        });
        save.addEventListener('click', function () {
            const payload = createPayload();
            if (payload) store.dispatch(payload);
            closeModal();
        });
        cancel.addEventListener('click', function () {
            closeModal();
        });

        btnAddMember.addEventListener('click', function () {
            btnAddMember.classList.add('hidden');
            memberControl.classList.remove('hidden');
        });
        memberCancel.addEventListener('click', function () {
            btnAddMember.classList.remove('hidden');
            memberControl.classList.add('hidden');
        });
        memberSave.addEventListener('click', function () {
            addMember();
            btnAddMember.classList.remove('hidden');
            memberControl.classList.add('hidden');
        });
    }

    function addMember() {
        const memberName = memberInput.value;
        if (memberName) {
            store.dispatch({
                details: {
                    memberId: generateId(),
                    name: memberName,
                },
                type: ADD_MEMBER,
            });
        }
    }

    function createPayload() {
        debugger;
        if (dueDate.value && description.value) {
            return {
                details: {
                    cardId: editCardId || generateId(),
                    description: description.value,
                    assignee: assignee.value,
                    dueDate: new Date(dueDate.value).getTime(),
                    state: status.value,
                },
                type: (editCardId && UPDATE_CARD) || ADD_CARD,
            };
        }
        return null;
    }
    function findCard(evt) {
        const parent = evt.target.closest('.card') && evt.target.closest('.card').id;
        const { cards } = store.getState();
        if (cards && cards.length) {
            return cards.find((item) => item.cardId === parent);
        }
        return null;
    }
    function openModal(data) {
        const { members } = store.getState();
        status.value = typeof data === 'string' ? data : PLANNED;
        assignee.value = members[0].memberId;
        editCardId = '';
        if (data && data.cardId) {
            description.value = data.description;
            assignee.value = data.assignee;
            dueDate.value = formatDateValue(data.dueDate);
            status.value = data.state;
            editCardId = data.cardId;
        }
        modalId.classList.add('active');
    }

    function closeModal() {
        description.value = '';
        dueDate.value = '';
        status.value = null;
        assignee.value = null;
        modalId.classList.remove('active');
    }

    function subscribe() {
        store.subscribe(() => {
            const { cards, members } = store.getState();
            renderMembers(members);
            renderCards(cards);
        });
    }

    function addMembers() {
        const members = ['Jenny', 'James', 'Jane'];
        store.dispatch({
            details: members.map((value) => {
                return {
                    memberId: generateId(),
                    name: value,
                };
            }),
            type: ADD_MEMBER,
        });
    }

    function renderCards(cards) {
        if (cards) {
            const planned = document.getElementById('planned-items');
            const started = document.getElementById('started-items');
            const done = document.getElementById('done-items');
            let template = '';

            planned.innerHTML = '';
            started.innerHTML = '';
            done.innerHTML = '';

            template = '';
            template += cards
                .map((item) => {
                    return item.state === PLANNED ? createCard(item) : '';
                })
                .join('');

            planned.innerHTML = template;

            template = '';
            template += cards
                .map((item) => {
                    return item.state === STARTED ? createCard(item) : '';
                })
                .join('');

            started.innerHTML = template;

            template = '';
            template += cards
                .map((item) => {
                    return item.state === DONE ? createCard(item) : '';
                })
                .join('');

            done.innerHTML = template;
        }
    }

    function formatDate(timestamp) {
        let date = new Date(timestamp);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return `${day}/${month}/${year}`;
    }

    function formatDateValue(timestamp) {
        let date = new Date(timestamp);
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var day = date.getDate().toString();
        return `${year}-${(month.length === 2 && month) || `0${month}`}-${
            (day.length === 2 && day) || `0${day}`
        }`;
    }

    function getAssignee(id) {
        const { members } = store.getState();
        return members.find((item) => item.memberId === id).name;
    }

    function createCard(card) {
        const currentDate = new Date(Date.now()).getTime();
        return `<div class="card ${
            card.dueDate < currentDate && card.state !== DONE ? 'red' : ''
        }" id="${card.cardId}">
            <div class="card-name">${card.description}</div>
            <div class="card-date">${formatDate(card.dueDate)}</div>
            <div class="card-assignee text-right">${getAssignee(card.assignee)}</div>
        </div>`;
    }

    function renderMembers(members) {
        const assignee = document.getElementById('assignee');
        const membersList = document.getElementById('members-container');

        membersList.innerHTML = '';
        assignee.innerHTML = '';

        let template = '';
        template += members
            .map((item) => {
                return `<option value=${item.memberId}>${item.name}</option>`;
            })
            .join('');
        assignee.innerHTML = template;

        template = '<ul class="members-list">';
        template += members
            .map((item) => {
                return `<li class="member" title="${item.name}" ><i class="mdi mdi-account-circle"></i><span class="tooltip">${item.name}</span></li>`;
            })
            .join('');
        template += '</ul>';
        membersList.innerHTML = template;
    }

    function initApp() {
        createAppStore();
        subscribe();
        addMembers();
        addListeners();
    }
    initApp();
})();
