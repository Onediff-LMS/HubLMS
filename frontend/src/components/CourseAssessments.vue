<template>
	<div>
		<div class="flex items-center justify-between">
			<div class="text-lg font-semibold mb-4">
				{{ __('Assessments') }}
			</div>
			<Button v-if="canSeeAddButton()" @click="showModal = true">
				<template #prefix>
					<Plus class="h-4 w-4" />
				</template>
				{{ __('Add') }}
			</Button>
		</div>
		<div class="flex items-center">
			<div class="p-2">
				<Autocomplete :options="[
					{
						label: 'Assignment 1',
						value: 'john-doe',
						image: 'https://randomuser.me/api/portraits/men/59.jpg',
					},
					{
						label: 'Assignment 2',
						value: 'jane-doe',
						image: 'https://randomuser.me/api/portraits/women/58.jpg',
					},
					{
						label: 'Assignment 3',
						value: 'john-smith',
						image: 'https://randomuser.me/api/portraits/men/59.jpg',
					},
				]" v-model="filter_assignment" placeholder="Assignment" />
			</div>
			<div class="p-2">
				<Autocomplete :options="[
					{
						label: 'Pending',
						value: 'john-doe',
						image: 'https://randomuser.me/api/portraits/men/59.jpg',
					},
					{
						label: 'Submitted',
						value: 'jane-doe',
						image: 'https://randomuser.me/api/portraits/women/58.jpg',
					},
					{
						label: 'Graded',
						value: 'john-smith',
						image: 'https://randomuser.me/api/portraits/men/59.jpg',
					},
				]" v-model="filter_status" placeholder="Submission Status" />
			</div>


		</div>
		<div v-if="assignment_submission_list.data?.length">
			<div class="py-2">
				<ListView :columns="[
					{
						label: 'Full Name',
						key: 'full_name',
					},
					{
						label: 'Email',
						key: 'email',
					},
					{
						label: 'Submission Status',
						key: 'submission_status',
						align: 'center',
					},
					{
						label: 'Instructor',
						key: 'instructors',
						align: 'center',
					},
					{
						label: 'Last Active',
						key: 'last_active',
					},
				]" :rows="assignment_submission_list.data" :options="{
					onRowClick: onRowClick,
					showTooltip: false,
				}" row-key="id">
					<template #group-header="{ group }">
						<span class="text-base font-medium leading-6 text-gray-900">
							{{ group.group }} ({{ group.rows.length }})
						</span>
					</template>
				</ListView>
			</div>
			<!-- <ListView :columns="getAssessmentColumns()" :rows="assessments.data" row-key="name" :options="{
				showTooltip: false,
				getRowRoute: (row) => getRowRoute(row),
			}">
				<ListHeader class="mb-2 grid items-center space-x-4 rounded bg-gray-100 p-2">
					<ListHeaderItem :item="item" v-for="item in getAssessmentColumns()">
						<template #prefix="{ item }">
							<component v-if="item.icon" :is="item.icon" class="h-4 w-4 stroke-1.5 ml-4" />
						</template>
					</ListHeaderItem>
				</ListHeader>
				<ListRows>
					<ListRow :row="row" v-for="row in assessments.data">
						<template #default="{ column, item }">
							<ListRowItem :item="row[column.key]" :align="column.align">
								<div>
									{{ row[column.key] }}
								</div>
							</ListRowItem>
						</template>
					</ListRow>
				</ListRows>
				<ListSelectBanner>
					<template #actions="{ unselectAll, selections }">
						<div class="flex gap-2">
							<Button variant="ghost" @click="removeAssessments(selections, unselectAll)">
								<Trash2 class="h-4 w-4 stroke-1.5" />
							</Button>
						</div>
					</template>
				</ListSelectBanner>
			</ListView> -->
		</div>
		<div v-else class="text-sm italic text-gray-600">
			{{ __('No Assessments') }}
		</div>
	</div>
	<AssessmentModal v-model="showModal" v-model:assessments="assessments" :course="props.course" />
	<Event v-model="showEvent" :event="current_submission" />
</template>
<script setup>
import {
	ListView,
	ListRow,
	ListRows,
	ListHeader,
	ListHeaderItem,
	ListRowItem,
	ListSelectBanner,
	createResource,
	Button,
	Autocomplete
} from 'frappe-ui'
import { inject, ref } from 'vue'
import AssessmentModal from '@/components/Modals/CourseAssessmentModal.vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import Event from '@/components/Modals/CourseEvent.vue'

const user = inject('$user')
const showModal = ref(false)
const currentEvent = ref(null)
const showEvent = ref(false)
const filter_assignment = ref()
const filter_status = ref()

const props = defineProps({
	course: {
		type: String,
		required: true,
	},
	rows: {
		type: Array,
	},
	columns: {
		type: Array,
	},
	options: {
		type: Object,
		default: () => ({
			selectable: true,
			totalCount: 0,
			rowCount: 0,
		}),
	},
})

const assessments = createResource({
	url: 'lms.lms.utils.get_course_assessments',
	params: {
		course: props.course,
	},
	auto: true,
})


const assignment_submission_list = createResource({
	url: 'lms.lms.utils.get_assignment_submission',
	params: {
		course: props.course,
	},
	auto: true,
})

const deleteAssessments = createResource({
	url: 'lms.lms.api.delete_documents',
	makeParams(values) {
		return {
			doctype: 'LMS Assessment',
			documents: values.assessments,
		}
	},
})

const removeAssessments = (selections, unselectAll) => {
	deleteAssessments.submit(
		{ assessments: Array.from(selections) },
		{
			onSuccess(data) {
				assessments.reload()
				unselectAll()
			},
		}
	)
}

const getRowRoute = (row) => {
	if (row.assessment_type == 'LMS Assignment') {
		if (row.submission) {
			return {
				name: 'AssignmentSubmission',
				params: {
					assignmentName: row.assessment_name,
					submissionName: row.submission.name,
				},
			}
		} else {
			return {
				name: 'AssignmentSubmission',
				params: {
					assignmentName: row.assessment_name,
					submissionName: 'new',
				},
			}
		}
	} else {
		return {
			name: 'QuizPage',
			params: {
				quizID: row.assessment_name,
			},
		}
	}
}

const getGroupRowRoute = (row) => ({
	name: "AssignmentSubmission", params: {
		assignmentName: row.id,
		submissionName: row.id
	},
})

let current_submission = ref()
const onRowClick = (row) => {
	current_submission.value = row.submission_data
	showEvent.value = true
}

const canSeeAddButton = () => {
	return user.data?.is_moderator || user.data?.is_evaluator
}

const getAssessmentColumns = () => {
	let columns = [
		{
			label: 'Assessment',
			key: 'title',
		},
		{
			label: 'Type',
			key: 'assessment_type',
		},
	]

	if (!user.data?.is_moderator) {
		columns.push({
			label: 'Status/Score',
			key: 'status',
			align: 'center',
		})
	}
	return columns
}

let groupedRows = ref(
	[
		{
			group: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
			collapsed: true,
			rows: [
				{
					id: 2,
					name: 'Gary Fox',
					email: 'gary@fox.com',
					status: 'Inactive',
					role: 'Developer',
				},
				{
					id: 6,
					name: 'Emily Davis',
					email: 'emily@davis.com',
					status: 'Active',
					role: 'Developer',
				},
				{
					id: 9,
					name: 'David Lee',
					email: 'david@lee.com',
					status: 'Inactive',
					role: 'Developer',
				},
			],
		},
		{
			group: 'Manager',
			collapsed: true,
			rows: [
				{
					id: 3,
					name: 'John Doe',
					email: 'john@doe.com',
					status: 'Active',
					role: 'Manager',
				},
				{
					id: 8,
					name: 'Sarah Wilson',
					email: 'sarah@wilson.com',
					status: 'Active',
					role: 'Manager',
				},
			],
		},
		{
			group: 'Designer',
			collapsed: true,
			rows: [
				{
					id: 4,
					name: 'Alice Smith',
					email: 'alice@smith.com',
					status: 'Active',
					role: 'Designer',
				},
				{
					id: 10,
					name: 'Olivia Taylor',
					email: 'olivia@taylor.com',
					status: 'Active',
					role: 'Designer',
				},
			],
		},
		{
			group: 'HR',
			collapsed: true,
			rows: [
				{
					id: 1,
					name: 'Jane Mary',
					email: 'jane@doe.com',
					status: 'Inactive',
					role: 'HR',
				},
				{
					id: 7,
					name: 'Michael Brown',
					email: 'michael@brown.com',
					status: 'Inactive',
					role: 'HR',
				},
				{
					id: 12,
					name: 'Sophia Martinez',
					email: 'sophia@martinez.com',
					status: 'Active',
					role: 'HR',
				},
			],
		},
		{
			group: 'Tester',
			collapsed: true,
			rows: [
				{
					id: 5,
					name: 'Bob Johnson',
					email: 'bob@johnson.com',
					status: 'Inactive',
					role: 'Tester',
				},
				{
					id: 11,
					name: 'James Anderson',
					email: 'james@anderson.com',
					status: 'Inactive',
					role: 'Tester',
				},
			],
		},
	]
)
</script>
