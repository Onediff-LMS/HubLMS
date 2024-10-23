<template>
	<div v-if="user.data?.is_moderator" class="">
		<header
			class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5"
		>
			<Breadcrumbs class="h-7" :items="breadcrumbs" />
			<Button v-if="user.data?.is_moderator" @click="openAnnouncementModal()">
				<span>
					{{ __('Make an Announcement') }}
				</span>
				<template #suffix>
					<SendIcon class="h-4 stroke-1.5" />
				</template>
			</Button>
		</header>
		<div v-if="course.data" class="grid grid-cols-[70%,30%] h-screen">
			<div class="border-r-2">
				<Tabs v-model="tabIndex" :tabs="tabs" tablistClass="overflow-y-hidden">
					<template #tab="{ tab, selected }" class="overflow-x-hidden">
						<div>
							<button
								class="group -mb-px flex items-center gap-1 border-b border-transparent py-2.5 text-base text-gray-600 duration-300 ease-in-out hover:border-gray-400 hover:text-gray-900"
								:class="{ 'text-gray-900': selected }"
							>
								<component
									v-if="tab.icon"
									:is="tab.icon"
									class="h-4 stroke-1.5"
								/>
								{{ __(tab.label) }}
								<Badge
									v-if="tab.count"
									:class="{
										'text-gray-900 border border-gray-900': selected,
									}"
									variant="subtle"
									theme="gray"
									size="sm"
								>
									{{ tab.count }}
								</Badge>
							</button>
						</div>
					</template>
					<!-- <template #default="{ tab }">
						<div class="pt-5 px-5 pb-10">
							
							<div v-if="tab.label == 'Dashboard'">
								<BatchDashboard :batch="batch" :isStudent="isStudent" />
							</div>
							<div v-else-if="tab.label == 'Live Class'">
								<LiveClass :batch="batch.data.name" />
							</div>
							<div v-else-if="tab.label == 'Students'">
								<BatchStudents :batch="batch.data.name" />
							</div>
							<div v-else-if="tab.label == 'Assessments'">
								<Assessments :batch="batch.data.name" />
							</div>
							<div v-else-if="tab.label == 'Announcements'">
								<Announcements :batch="batch.data.name" />
							</div>
							<div v-else-if="tab.label == 'Discussions'">
								<Discussions
									doctype="LMS Batch"
									:docname="batch.data.name"
									:title="__('Discussions')"
									:key="batch.data.name"
									:singleThread="true"
									:scrollToBottom="true"
								/>
							</div>
						</div>
					</template> -->
				</Tabs>
			</div>
			<div class="p-5">
				<div class="text-2xl font-semibold mb-2">
					{{ course.data.title }}
				</div>
				<div class="my-3 leading-6">
					{{ course.data.short_introduction }}
				</div>
				<div v-html="course.data.description" class="leading-5 mb-2"></div>
				<div class="flex items-center">
					<Tooltip
						v-if="course.data.avg_rating"
						:text="__('Average Rating')"
						class="flex items-center"
					>
						<Star class="h-5 w-5 text-gray-100 fill-orange-500" />
						<span class="ml-1">
							{{ course.data.avg_rating }}
						</span>
					</Tooltip>
					<span v-if="course.data.avg_rating" class="mx-3">&middot;</span>
					<Tooltip
						v-if="course.data.enrollment_count"
						:text="__('Enrolled Students')"
						class="flex items-center"
					>
						<Users class="h-4 w-4 text-gray-700" />
						<span class="ml-1">
							{{ course.data.enrollment_count_formatted }}
						</span>
					</Tooltip>
					<span v-if="course.data.enrollment_count" class="mx-3"
						>&middot;</span
					>
					<div class="flex items-center">
						<span
							class="h-6 mr-1"
							:class="{
								'avatar-group overlap': course.data.instructors.length > 1,
							}"
						>
							<UserAvatar
								v-for="instructor in course.data.instructors"
								:user="instructor"
							/>
						</span>
						<CourseInstructors :instructors="course.data.instructors" />
					</div>
				</div>

				<!-- <div class="flex avatar-group overlap mb-5">
					<div
						class="h-6 mr-1"
						:class="{
							'avatar-group overlap': batch.data.instructors.length > 1,
						}"
					>
						<UserAvatar
							v-for="instructor in batch.data.instructors"
							:user="instructor"
						/>
					</div>
					<CourseInstructors :instructors="batch.data.instructors" />
				</div> -->
				<!-- <DateRange
					:startDate="batch.data.start_date"
					:endDate="batch.data.end_date"
					class="mb-3"
				/> -->
				<!-- <div class="flex items-center mb-4">
					<Clock class="h-4 w-4 stroke-1.5 mr-2 text-gray-700" />
					<span>
						{{ formatTime(batch.data.start_time) }} -
						{{ formatTime(batch.data.end_time) }}
					</span>
				</div>
				<div v-if="batch.data.timezone" class="flex items-center mb-4">
					<Globe class="h-4 w-4 stroke-1.5 mr-2 text-gray-700" />
					<span>
						{{ batch.data.timezone }}
					</span>
				</div> -->
			</div>
			<!-- <AnnouncementModal
				v-model="showAnnouncementModal"
				:batch="batch.data.name"
				:students="batch.data.students"
			/> -->
		</div>
	</div>
	<div v-else-if="!user.data?.name" class="">
		<div class="text-base border rounded-md w-1/3 mx-auto my-32">
			<div class="border-b px-5 py-3 font-medium">
				<span
					class="inline-flex items-center before:bg-red-600 before:w-2 before:h-2 before:rounded-md before:mr-2"
				></span>
				{{ __('Not Permitted') }}
			</div>
			<div class="px-5 py-3">
				<div v-if="user.data" class="mb-4 leading-6">
					{{
						__(
							'You are not a member of this batch. Please checkout our upcoming batches.'
						)
					}}
				</div>
				<div v-else class="mb-4 leading-6">
					{{ __('Please login to access this page.') }}
				</div>
				
				<Button
					v-else
					variant="solid"
					class="w-full"
					@click="redirectToLogin()"
				>
					{{ __('Login') }}
				</Button>
			</div>
		</div>
	</div>
</template>
<script setup>
import { Breadcrumbs, Button, createResource, Tabs, Badge } from 'frappe-ui'
import { computed, inject, ref } from 'vue'
import CourseInstructors from '@/components/CourseInstructors.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import {
	Clock,
	LayoutDashboard,
	BookOpen,
	Laptop,
	BookOpenCheck,
	Contact2,
	Mail,
	SendIcon,
	MessageCircle,
	Globe,
} from 'lucide-vue-next'
import { formatTime, updateDocumentTitle } from '@/utils'
import BatchDashboard from '@/components/BatchDashboard.vue'
import BatchCourses from '@/components/BatchCourses.vue'
import LiveClass from '@/components/LiveClass.vue'
import BatchStudents from '@/components/BatchStudents.vue'
import Assessments from '@/components/Assessments.vue'
import Announcements from '@/components/Annoucements.vue'
import AnnouncementModal from '@/components/Modals/AnnouncementModal.vue'
import Discussions from '@/components/Discussions.vue'
import DateRange from '@/components/Common/DateRange.vue'

const user = inject('$user')
const showAnnouncementModal = ref(false)

const props = defineProps({
	courseName: {
		type: String,
		required: true,
	},
})

const course = createResource({
	url: 'lms.lms.utils.get_course_details',
	cache: ['course', props.courseName],
	params: {
		course: props.courseName,
	},
	auto: true,
})

const breadcrumbs = computed(() => {
	let items = [{ label: 'All Courses', route: { name: 'Courses' } }]
	items.push({
		label: course?.data?.title,
		route: { name: 'CourseDetail', params: { course: course?.data?.name } },
	})
	return items
})

// const isStudent = computed(() => {
// 	return (
// 		user?.data &&
// 		batch.data?.students.length &&
// 		batch.data?.students.includes(user.data.name)
// 	)
// })

const tabIndex = ref(0)
const tabs = computed(() => {
	let batchTabs = []
	// if (isStudent.value) {
		batchTabs.push({
			label: 'Dashboard',
			icon: LayoutDashboard,
		})
	// }
	if (user.data?.is_moderator) {
		batchTabs.push({
			label: 'Students',
			icon: Contact2,
		})
		batchTabs.push({
			label: 'Assessments',
			icon: BookOpenCheck,
		})
	}
	batchTabs.push({
		label: 'Live Class',
		icon: Laptop,
	})
	batchTabs.push({
		label: 'Announcements',
		icon: Mail,
	})
	batchTabs.push({
		label: 'Discussions',
		icon: MessageCircle,
	})
	return batchTabs
})

const redirectToLogin = () => {
	window.location.href = `/login?redirect-to=/batches`
}

const openAnnouncementModal = () => {
	showAnnouncementModal.value = true
}

const pageMeta = computed(() => {
	return {
		title: course.data?.title,
		description: course.data?.description,
	}
})

updateDocumentTitle(pageMeta)
</script>
