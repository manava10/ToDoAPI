const Notes = require("../models/notes");
exports.createNote =async (req,res) => {
    try {
        const {title, content} = req.body;
        if (!title || !content) {
            return res.status(400).json({
                "message": "Title or Content cannot be empty"
            })
        }
        const note = await Notes.create({
            userId: req.user._id, title, content
        })
        res.status(201).json({
            "message": "Note created",
            "notes":{
                "title":title,
                "content":content
            }
        })
    } catch (err) {
        return res.status(400).json({
            "message": "Something went wrong"
        })
    }
}
exports.getNotes = async (req,res) =>{
    try{
        const notes = await Notes.find({userId:req.user._id});
        res.status(200).json({
            "message":"Notes retrieved successfully",
            "notes": notes
        });
    }catch(err){
        return res.status(500).json({
            "message":"Server error while retriving notes"
        })
    }
}