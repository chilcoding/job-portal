import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        // Check for missing fields
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        // Validate salary - Ensure it's a valid number
        const parsedSalary = Number(salary);
        if (isNaN(parsedSalary)) {
            return res.status(400).json({
                message: "Invalid salary value.",
                success: false
            });
        }

        // Handle experience level (string range like "3-5 years")
        let experienceLevel;
        if (typeof experience === 'string' && experience.includes('-')) {
            // Example: "3-5 years" -> take the lower bound (3)
            experienceLevel = parseInt(experience.split('-')[0].trim(), 10);
            if (isNaN(experienceLevel)) {
                return res.status(400).json({
                    message: "Invalid experience level.",
                    success: false
                });
            }
        } else {
            experienceLevel = Number(experience);
            if (isNaN(experienceLevel)) {
                return res.status(400).json({
                    message: "Invalid experience level.",
                    success: false
                });
            }
        }

        // Create the job in the database
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: parsedSalary,
            location,
            jobType,
            experienceLevel,
            position,
            company: companyId,
            created_by: userId
        });

        // Return a success response
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false
        });
    }
};

// student k liye: Get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        };

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false
        });
    }
};

// student k liye: Get job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false
        });
    }
};

// admin k liye: Get jobs created by admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });

        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error.",
            success: false
        });
    }
};
